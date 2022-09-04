import {LayerBase} from '../base'
import {create, DataPoint, HeatmapConfiguration} from '@mars3d/heatmap.js'
import {createScale, createStyle, validateAndCreateData} from '../helpers'
import {DataTableList} from '../../data'
import {
  ChartContext,
  LayerHeatmapStyleShape,
  LayerHeatmapOptions,
  LayerHeatmapScaleShape,
} from '../../types'
import {select} from 'd3'

const defaultStyle: LayerHeatmapStyleShape = {
  blur: 1,
  radius: 10,
  maxOpacity: 0.5,
  minOpacity: 0,
  gradient: {
    0.3: 'green',
    0.6: 'yellow',
    0.9: 'red',
  },
}

export class LayerHeatmap extends LayerBase<LayerHeatmapOptions> {
  private instance: h337.Heatmap<'value', 'x', 'y'>

  private _data: Maybe<DataTableList>

  private _scale: LayerHeatmapScaleShape

  private _style = defaultStyle

  private pointData: DataPoint<'value', 'x', 'y'>[] = []

  get data() {
    return this._data
  }

  get scale() {
    return this._scale
  }

  get style() {
    return this._style
  }

  constructor(options: LayerHeatmapOptions, context: ChartContext) {
    super({options, context, sublayers: ['text']})
    const container = select(this.options.container)
    this.instance = create({container: container.node()!})
    this.event.on('destroy', () => container.selectAll('.heatmap-canvas').remove())
    container.selectAll('.heatmap-canvas').style('pointer-events', 'none')
  }

  setData(data: LayerHeatmap['data']) {
    this._data = validateAndCreateData('tableList', this.data, data)
  }

  setScale(scale: LayerHeatmapScaleShape) {
    this._scale = createScale(undefined, this.scale, scale)
  }

  setStyle(style: LayerHeatmapStyleShape) {
    this._style = createStyle(defaultStyle, this.style, style)
    this.instance.configure(this.style as HeatmapConfiguration)
  }

  update() {
    if (!this.data || !this.scale?.scaleX || !this.scale.scaleY) {
      throw new Error('Invalid data or scale')
    }

    const {left, top} = this.options.layout,
      {scaleX, scaleY} = this.scale,
      {rawTableList} = this.data

    this.pointData = rawTableList.map(([x, y, value]) => ({
      value: Number(value),
      // why?
      x: left + Number(scaleX(x).toFixed(0)),
      y: top + scaleY(y),
    }))
  }

  draw() {
    this.instance.setData({data: this.pointData, max: Infinity, min: -Infinity})
  }
}
