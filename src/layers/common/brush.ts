import {LayerBase} from '../base'
import {createScale, createStyle} from '../helpers'
import {addStyle, isSvgContainer, transformAttr} from '../../utils'
import {BrushBehavior, D3BrushEvent, brushX, brushY} from 'd3'
import {
  ChartContext,
  LayerAxisScaleShape,
  LayerBrushOptions,
  LayerBrushStyleShape,
} from '../../types'

const defaultStyle: LayerBrushStyleShape = {
  targets: [],
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
  private _scale: Omit<LayerAxisScaleShape, 'nice'> = {}

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

  setScale(scale: LayerAxisScaleShape) {
    this._scale = createScale(undefined, this.scale, scale)
  }

  setStyle(style: LayerBrushStyleShape) {
    this._style = createStyle(defaultStyle, this._style, style)
  }

  update() {
    if (!this.scale) {
      throw new Error('Invalid scale')
    }

    if (!isSvgContainer(this.root)) {
      this.log.warn('The brush only supports svg')
      return
    }

    const {direction} = this.style,
      {width, height, left, top} = this.options.layout,
      [x1, x2, y1, y2] = [left, left + width, top, top + height]

    this.brush = direction === 'horizontal' ? brushX() : brushY()
    this.brush.on('brush', this.brushed.bind(this)).extent([
      [x1, y1],
      [x2, y2],
    ])

    this.root
      .selectAll('.chart-brush')
      .data([null as any])
      .join('g')
      .attr('class', 'chart-brush')
      .call(this.brush as any)
      .call(this.brush.move as any, direction === 'horizontal' ? [x1, x2] : [y1, y2])
  }

  private brushed(event: D3BrushEvent<unknown>) {
    const {direction, targets} = this.style,
      {layout, bindCoordinate} = this.options,
      {width, height, left, top} = layout,
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

      // consider boundary
      if (name === 'scaleColor') {
        const relativeColorEnd = start + (end - start) / zoomFactor - Number.MIN_VALUE,
          colorOffset = offsetFactor * (relativeColorEnd - start)

        scale.range(
          colors.map((color: string, i: number) =>
            i >= start + colorOffset && i <= relativeColorEnd + colorOffset ? color : '#00000000'
          )
        )
      } else {
        scale.range([start - offset, relativeEnd - offset])
      }
    })

    bindCoordinate({trigger: this, redraw: true})

    if (isSvgContainer(this.root)) {
      addStyle(this.root.selectAll('.overlay'), transformAttr(this.style.background ?? {}))
      addStyle(this.root.selectAll('.selection'), transformAttr(this.style.selection ?? {}))
      addStyle(this.root.selectAll('.handle--w'), transformAttr(this.style.leftHandle ?? {}))
      addStyle(this.root.selectAll('.handle--e'), transformAttr(this.style.rightHandle ?? {}))

      const leftHandle = this.root.selectAll('.handle--w'),
        rightHandle = this.root.selectAll('.handle--e')

      ;[leftHandle, rightHandle].forEach((handle) => {
        const [x, y, width, height] = [
          Number(handle.attr('x')),
          Number(handle.attr('y')),
          Number(handle.attr('width')),
          Number(handle.attr('height')),
        ]
        handle.attr('transform-origin', `${x + width / 2} ${y + height / 2}`)
        handle.attr('stroke-width', Number(handle.attr('stroke-width')) * 2)
        handle.attr('transform', 'scale(0.5)')
      })
    }
  }

  draw() {}
}
