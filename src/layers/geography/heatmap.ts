import {LayerBase} from '../base'
import {DataTableList} from '../../data'
import {createScale, createStyle, validateAndCreateData} from '../helpers'
import {group, isRealNumber, tableListToObjects} from '../../utils'
import {
  ChartContext,
  LayerHeatmapStyleShape,
  LayerHeatmapOptions,
  LayerHeatmapScaleShape,
  DrawerDataShape,
  CircleDrawerProps,
} from '../../types'

type DataKey = 'x' | 'y' | 'value'

const defaultStyle: LayerHeatmapStyleShape = {
  radiusFactor: 1,
  heatZone: {
    fill: ['#ff0000DD', '#ffff99AA', '#00ff0000'],
  },
}

export class LayerHeatmap extends LayerBase<LayerHeatmapOptions> {
  private _data: Maybe<DataTableList>

  private _scale: LayerHeatmapScaleShape

  private _style = defaultStyle

  private heatZoneData: (DrawerDataShape<CircleDrawerProps> & {
    color?: string
  })[] = []

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
    super({options, context, sublayers: ['heatZone']})
  }

  setData(data: LayerHeatmap['data']) {
    this._data = validateAndCreateData('tableList', this.data, data)
  }

  setScale(scale: LayerHeatmapScaleShape) {
    this._scale = createScale(undefined, this.scale, scale)
  }

  setStyle(style: LayerHeatmapStyleShape) {
    this._style = createStyle(defaultStyle, this.style, style)
  }

  update() {
    if (!this.data || !this.scale?.scaleX || !this.scale.scaleY) {
      throw new Error('Invalid data or scale')
    }

    const {layout, createGradient} = this.options,
      {scaleX, scaleY} = this.scale,
      {heatZone, radiusFactor = 1} = this.style,
      data = tableListToObjects<DataKey>(this.data.source),
      color = createGradient({type: 'radial', colors: group(heatZone?.fill)})

    this.heatZoneData = data
      .map((item) => ({
        x: layout.left + scaleX(item.x),
        y: layout.top + scaleY(item.y),
        r: radiusFactor * Number(item.value),
        color: color as string,
      }))
      .filter(({x, y}) => {
        return isRealNumber(x) && isRealNumber(y)
      })
  }

  draw() {
    const heatZoneData = {
      data: this.heatZoneData,
      ...this.style.heatZone,
      fill: this.heatZoneData.map(({color}) => color!),
    }

    this.drawBasic({type: 'circle', data: [heatZoneData], sublayer: 'heatZone'})
  }
}
