import {LayerBase} from '../base'
import {createScale, createStyle} from '../helpers'
import {addStyle, isSC, transformAttr} from '../../utils'
import {BrushBehavior, D3BrushEvent, brushX, brushY} from 'd3'
import {
  ChartContext,
  LayerAxisScale,
  LayerBrushOptions,
  LayerBrushStyle,
  LayerStyle,
} from '../../types'

const defaultStyle: LayerBrushStyle = {
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
  leftHandle: {
    stroke: 'gray',
    strokeWidth: 1,
    fill: 'white',
  },
  rightHandle: {
    stroke: 'gray',
    strokeWidth: 1,
    fill: 'white',
  },
}

export class LayerBrush extends LayerBase<LayerBrushOptions> {
  private _scale: Omit<LayerAxisScale, 'nice'> = {}

  private originScaleRangeMap: Map<string, any[]> = new Map()

  private brush: Maybe<BrushBehavior<unknown>>

  private _style = defaultStyle

  get data() {
    return null
  }

  get scale() {
    return this._scale
  }

  get style() {
    return this._style
  }

  constructor(options: LayerBrushOptions, context: ChartContext) {
    super({options, context, sublayers: ['text']})
  }

  setData() {}

  setScale(scale: LayerAxisScale) {
    this._scale = createScale(undefined, this.scale, scale)
  }

  setStyle(style: LayerStyle<LayerBrushStyle>) {
    this._style = createStyle(this.options, defaultStyle, this._style, style)
  }

  update() {
    if (!this.scale) {
      throw new Error('Invalid scale')
    }

    if (!isSC(this.root)) {
      this.log.warn('The brush only supports svg')
      return
    }

    const {layout, createGradient} = this.options,
      {width, height, left, top} = layout,
      {direction = 'horizontal', targets} = this.style,
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
      .call(this.brush as any)
      .call(this.brush.move as any, direction === 'horizontal' ? [x1, x2] : [y1, y2])

    if (this.scale.scaleColor && targets?.includes('scaleColor')) {
      const backgroundColor = createGradient({
        direction,
        type: 'linear',
        colors: this.scale.scaleColor.range(),
      }) as string

      this.root
        .selectAll('.overlay')
        .attr('fill', backgroundColor)
        .attr('clip-path', `url(#brush-selection-${this.options.id})`)
      this.root
        .selectAll('clipPath')
        .data([null])
        .join('clipPath')
        .attr('id', `brush-selection-${this.options.id}`)
        .append('rect')
        .attr('fill', '#ffffff')
        .attr('x', left)
        .attr('y', top)
        .attr('width', width)
        .attr('height', height)
    }
  }

  private brushed(event: D3BrushEvent<unknown>) {
    const {layout, bindCoordinate} = this.options,
      {width, height, left, top} = layout,
      {direction, targets, handleZoom = 1} = this.style,
      total = direction === 'horizontal' ? width : height,
      selection = (event.selection ?? [0, total]) as [number, number],
      zoomFactor = total / Math.max(selection[1] - selection[0], Number.MIN_VALUE)

    Object.entries(this.scale).forEach(([name, scale]) => {
      if (!targets?.includes(name) || !scale) return
      if (!this.originScaleRangeMap.has(name)) {
        if (name === 'scaleColor') {
          this.originScaleRangeMap.set(name, [0, scale.range().length - 1, scale.range()])
        } else {
          this.originScaleRangeMap.set(name, scale.range())
        }
      }

      const [start, end, colors] = this.originScaleRangeMap.get(name) ?? [0, 0],
        relativeEnd = start + (end - start) * zoomFactor,
        offsetFactor = (selection[0] - (direction === 'horizontal' ? left : top)) / total,
        offset = offsetFactor * (relativeEnd - start)

      if (name === 'scaleColor') {
        const offset = offsetFactor * (end - start),
          relativeColorEnd = start + (end - start) / zoomFactor - Number.MIN_VALUE,
          hasColor = (i: number) => i >= start + offset && i <= relativeColorEnd + offset
        scale.range(colors.map((color: string, i: number) => (hasColor(i) ? color : '#ffffff00')))
      } else {
        scale.range([start - offset, relativeEnd - offset])
      }
    })

    bindCoordinate({trigger: this, redraw: true})

    if (isSC(this.root)) {
      addStyle(this.root.selectAll('.overlay'), transformAttr(this.style.background ?? {}))
      addStyle(this.root.selectAll('.selection'), transformAttr(this.style.selection ?? {}))
      addStyle(this.root.selectAll('.handle--w'), transformAttr(this.style.leftHandle ?? {}))
      addStyle(this.root.selectAll('.handle--e'), transformAttr(this.style.rightHandle ?? {}))

      const selection = this.root.selectAll('.selection'),
        handles = [this.root.selectAll('.handle--w'), this.root.selectAll('.handle--e')]

      handles.forEach((handle) => {
        const [x, y, width, height] = [
          Number(handle.attr('x')),
          Number(handle.attr('y')),
          Number(handle.attr('width')),
          Number(handle.attr('height')),
        ]
        handle.attr('transform-origin', `${x + width / 2} ${y + height / 2}`)
        handle.attr('stroke-width', Number(handle.attr('stroke-width')) / handleZoom)
        handle.attr('transform', `scale(${handleZoom})`)
      })

      this.root
        .select(`#brush-selection-${this.options.id}`)
        .selectAll('rect')
        .attr('x', selection.attr('x'))
        .attr('y', selection.attr('y'))
        .attr('width', selection.attr('width'))
        .attr('height', selection.attr('height'))
    }
  }

  draw() {}
}
