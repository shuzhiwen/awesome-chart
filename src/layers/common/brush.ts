import {LayerBase} from '../base'
import {createScale, createStyle} from '../helpers'
import {
  ChartContext,
  LayerAxisScaleShape,
  LayerBrushOptions,
  LayerBrushStyleShape,
} from '../../types'
import {isSvgContainer} from '../../utils'
import {BrushBehavior, D3BrushEvent, brushX, brushY} from 'd3'

const defaultStyle: LayerBrushStyleShape = {
  direction: 'horizontal',
  targets: [],
}

export class LayerBrush extends LayerBase<LayerBrushOptions> {
  private _scale: Omit<LayerAxisScaleShape, 'nice'> = {}

  private originScaleRangeMap: Map<string, number[]> = new Map()

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
      zoomFactor = total / (selection[1] - selection[0])

    Object.entries(this.scale).forEach(([name, scale]) => {
      if (!targets?.includes(name)) {
        return
      }

      if (!this.originScaleRangeMap.has(name)) {
        this.originScaleRangeMap.set(name, scale.range())
      }

      const [start, end] = this.originScaleRangeMap.get(name) ?? [0, 0],
        nextEnd = start + (end - start) * zoomFactor,
        offsetFactor = (selection[0] - (direction === 'horizontal' ? left : top)) / total,
        offset = offsetFactor * (nextEnd - start)

      scale.range([start - offset, nextEnd - offset])
    })

    bindCoordinate({trigger: this, redraw: true})
  }

  draw() {}
}
