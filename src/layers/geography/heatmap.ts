import {DataTableList} from '../../data'
import {
  ChartContext,
  CircleDrawerProps,
  DrawerData,
  LayerHeatmapOptions,
  LayerHeatmapScale,
  LayerHeatmapStyle,
  LayerStyle,
} from '../../types'
import {group, isRealNumber, tableListToObjects} from '../../utils'
import {LayerBase} from '../base'
import {createScale, createStyle, validateAndCreateData} from '../helpers'

type DataKey = 'x' | 'y' | 'value'

const defaultStyle: LayerHeatmapStyle = {
  radiusFactor: 1,
  heatZone: {
    fill: ['#ff0000dd', '#ffff99aa', '#00ff0000'],
  },
}

export class LayerHeatmap extends LayerBase<LayerHeatmapOptions> {
  private _data: Maybe<DataTableList>

  private _scale: LayerHeatmapScale

  private _style = defaultStyle

  private heatZoneData: (DrawerData<CircleDrawerProps> & {
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

  setScale(scale: LayerHeatmapScale) {
    this._scale = createScale(undefined, this.scale, scale)
  }

  setStyle(style: LayerStyle<LayerHeatmapStyle>) {
    this._style = createStyle(this.options, defaultStyle, this.style, style)
  }

  update() {
    if (!this.data || !this.scale?.scaleX || !this.scale.scaleY) {
      throw new Error('Invalid data or scale')
    }

    const {scaleX, scaleY} = this.scale,
      {layout, createGradient} = this.options,
      {heatZone, radiusFactor = 1} = this.style,
      data = tableListToObjects<DataKey>(this.data.source)

    this.heatZoneData = data
      .map((item) => ({
        x: layout.left + scaleX(item.x),
        y: layout.top + scaleY(item.y),
        r: radiusFactor * Number(item.value),
      }))
      .filter(({x, y}) => isRealNumber(x) && isRealNumber(y))
      .map((item) => ({
        ...item,
        color: createGradient({
          type: 'radial',
          r2: item.r,
          width: item.x + item.r,
          height: item.y + item.r,
          colors: group(heatZone?.fill),
          x1: item.x / (item.x + item.r),
          x2: item.x / (item.x + item.r),
          y1: item.y / (item.y + item.r),
          y2: item.y / (item.y + item.r),
        }) as string,
      }))
  }

  draw() {
    const heatZoneData = {
      data: this.heatZoneData,
      ...this.style.heatZone,
      fill: this.heatZoneData.map(({color}) => color!),
      evented: false,
    }

    this.drawBasic({type: 'circle', data: [heatZoneData], sublayer: 'heatZone'})
  }
}
