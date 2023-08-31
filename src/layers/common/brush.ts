import {BrushBehavior, brushX, brushY, D3BrushEvent} from 'd3'
import {debounce} from 'lodash'
import {
  Box,
  ChartContext,
  D3Selection,
  LayerAxisScale,
  LayerBrushStyle,
  LayerOptions,
  LayerStyle,
} from '../../types'
import {addStyle, isSC, transformAttr} from '../../utils'
import {LayerBase} from '../base'
import {createScale, createStyle} from '../helpers'

const defaultStyle: LayerBrushStyle = {
  targets: [],
  debounce: 300,
  handleZoom: 0.5,
  direction: 'horizontal',
  selection: {
    fill: 'rgb(0,119,255)',
    fillOpacity: 0.3,
    strokeWidth: 0,
    rx: 4,
    ry: 4,
  },
  background: {
    stroke: '#ffffff',
    strokeOpacity: 0.3,
    rx: 4,
    ry: 4,
  },
  handle: {
    stroke: 'gray',
    strokeWidth: 1,
    fill: 'white',
  },
}

export class LayerBrush extends LayerBase<never> {
  private _scale: Omit<LayerAxisScale, 'nice'> = {}

  private rangeMapping: Map<string, any[]> = new Map()

  private brush: Maybe<BrushBehavior<unknown>>

  private rebuildScale: ChartContext['rebuildScale']

  private _style = defaultStyle

  private clipPathId

  get data() {
    return null
  }

  get scale() {
    return this._scale
  }

  get style() {
    return this._style
  }

  constructor(options: LayerOptions) {
    super({options})
    this.clipPathId = `brush-selection-${this.options.id}`
    this.rebuildScale = debounce(this.options.rebuildScale, this.style.debounce)
  }

  setScale(scale: LayerAxisScale) {
    this._scale = createScale(undefined, this.scale, scale)
  }

  setStyle(style: LayerStyle<LayerBrushStyle>) {
    this._style = createStyle(this.options, defaultStyle, this.style, style)
    this.rebuildScale = debounce(this.options.rebuildScale, this.style.debounce)
  }

  update() {
    if (!isSC(this.root)) {
      throw new Error('The brush only supports svg')
    }

    const {layout, createGradient} = this.options,
      {width, height, left, top} = layout,
      {direction, targets} = this.style,
      [x1, x2, y1, y2] = [left, left + width, top, top + height]

    this.brush = direction === 'horizontal' ? brushX() : brushY()
    this.brush.on('brush', this.brushed.bind(this)).extent([
      [x1, y1],
      [x2, y2],
    ])

    this.root
      .selectAll('.chart-brush')
      .data([null])
      .join('g')
      .attr('class', 'chart-brush')
      .call(this.brush as AnyFunction)
      .call(
        this.brush.move as AnyFunction,
        direction === 'horizontal' ? [x1, x2] : [y1, y2]
      )

    if (this.scale.scaleColor && targets.includes('scaleColor')) {
      const backgroundColor = createGradient({
        x1,
        x2,
        direction,
        type: 'linear',
        colors: this.scale.scaleColor.range(),
      }) as string

      this.root
        .selectAll('.overlay')
        .attr('fill', backgroundColor)
        .attr('clip-path', `url(#${this.clipPathId})`)
      this.root
        .selectAll('clipPath')
        .data([null])
        .join('clipPath')
        .attr('id', this.clipPathId)
        .append('rect')
        .attr('fill', '#ffffff')
        .attr('x', left)
        .attr('y', top)
        .attr('width', width)
        .attr('height', height)
    }
  }

  private getBox(selection: D3Selection): Box {
    return {
      x: Number(selection.attr('x')),
      y: Number(selection.attr('y')),
      width: Number(selection.attr('width')),
      height: Number(selection.attr('height')),
    }
  }

  private brushed(event: D3BrushEvent<unknown>) {
    if (!isSC(this.root)) {
      throw new Error('The brush only supports svg')
    }

    const {direction, targets} = this.style,
      {width, height, left, top} = this.options.layout,
      total = direction === 'horizontal' ? width : height,
      [min, max] = (event.selection ?? [0, total]) as Vec2,
      zoomFactor = total / Math.max(max - min, Number.MIN_VALUE)

    Object.entries(this.scale).forEach(([name, scale]) => {
      if (!targets.includes(name as Keys<LayerBrush['scale']>)) return
      if (!this.rangeMapping.has(name)) {
        if (name === 'scaleColor') {
          this.rangeMapping.set(name, [
            0,
            scale.range().length - 1,
            scale.range(),
          ])
        } else {
          this.rangeMapping.set(name, scale.range())
        }
      }

      const [start, end, colors] = this.rangeMapping.get(name) ?? [0, 0],
        relativeEnd = start + (end - start) * zoomFactor,
        offsetFactor =
          (min - (direction === 'horizontal' ? left : top)) / total,
        offset = offsetFactor * (relativeEnd - start)

      if (name === 'scaleColor') {
        const offset = offsetFactor * (end - start),
          relativeColorEnd =
            start + (end - start) / zoomFactor - Number.MIN_VALUE,
          hasColor = (i: number) =>
            i >= start + offset && i <= relativeColorEnd + offset

        scale.range(
          colors.map((color: string, i: number) =>
            hasColor(i) ? color : '#ffffff00'
          )
        )
      } else {
        scale.range([start - offset, relativeEnd - offset])
      }
    })

    const selection = this.root.selectAll('.selection'),
      leftHandle = this.root.selectAll('.handle--w'),
      rightHandle = this.root.selectAll('.handle--e'),
      lb = this.getBox(leftHandle),
      rb = this.getBox(rightHandle)

    leftHandle.attr(
      'transform-origin',
      `${lb.x + lb.width / 2}px ${lb.y + lb.height / 2}px`
    )
    rightHandle.attr(
      'transform-origin',
      `${rb.x + rb.width / 2}px ${rb.y + rb.height / 2}px`
    )
    addStyle(
      this.root.select(`#${this.clipPathId}`).selectAll('rect'),
      this.getBox(selection)
    )

    this.rebuildScale({trigger: this, redraw: true})
  }

  draw() {
    if (!isSC(this.root)) {
      throw new Error('The brush only supports svg')
    }

    const {selection = {}, background = {}, handle, handleZoom} = this.style
    const handlers = [
      this.root.selectAll('.handle--w'),
      this.root.selectAll('.handle--e'),
    ]

    addStyle(this.root.selectAll('.overlay'), transformAttr(background))
    addStyle(this.root.selectAll('.selection'), transformAttr(selection))

    handlers.forEach((handler) =>
      addStyle(
        handler,
        transformAttr({
          ...handle,
          strokeWidth: Number(handle.strokeWidth) / handleZoom,
          transform: `scale(${handleZoom})`,
        })
      )
    )
  }
}
