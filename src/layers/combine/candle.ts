import {LayerBase} from '../base'
import {DataTableList} from '../../data'
import {createScale, createStyle, validateAndCreateData} from '../helpers'
import {LayerRect} from '../normal'
import {uuid} from '../../utils'
import {merge} from 'lodash'
import {
  ChartContext,
  LayerCandleStyle,
  LegendData,
  LayerCandleOptions,
  LayerRectScale,
  CacheAnimationOptions,
} from '../../types'

const defaultStyle: LayerCandleStyle = {
  positiveColor: 'red',
  negativeColor: 'green',
  rect: {
    background: {hidden: true},
    text: {hidden: true},
  },
  line: {
    fixedWidth: 4,
    background: {hidden: true},
    text: {hidden: true},
  },
}

export class LayerCandle extends LayerBase<LayerCandleOptions> {
  public legendData: Maybe<LegendData>

  private _data: Maybe<DataTableList>

  private _scale: LayerRectScale

  private _style = defaultStyle

  private rectLayer: LayerRect

  private lineLayer: LayerRect

  get scale() {
    return this._scale
  }

  get data() {
    return this._data
  }

  get style() {
    return this._style
  }

  constructor(options: LayerCandleOptions, context: ChartContext) {
    super({context, options, sublayers: ['rect', 'text']})
    const {layout, createSublayer} = this.options

    this.event.on('destroy', () => {
      this.rectLayer.destroy()
      this.lineLayer.destroy()
    })

    this.lineLayer = createSublayer({
      id: uuid(),
      layout,
      type: 'rect',
      mode: 'interval',
      variant: 'column',
      sublayerConfig: {root: this.root},
    }) as LayerRect
    this.rectLayer = createSublayer({
      id: uuid(),
      layout,
      type: 'rect',
      mode: 'interval',
      variant: 'column',
      sublayerConfig: {root: this.root},
    }) as LayerRect
  }

  setData(data: LayerCandle['data']) {
    this._data = validateAndCreateData('tableList', this.data, data, (tableList) => {
      tableList?.sort({mode: 'asc', targets: 'dimension', variant: 'date'})
      return tableList
    })

    if (!this.data) return

    const {rawTableList, headers} = this.data

    this.rectLayer.setData(
      new DataTableList([headers.slice(0, 3), ...rawTableList.map((row) => row.slice(0, 3))])
    )
    this.lineLayer.setData(
      new DataTableList([
        headers.slice(0, 1).concat(headers.slice(3, 5)),
        ...rawTableList.map((row) => row.slice(0, 1).concat(row.slice(3, 5))),
      ])
    )
  }

  setScale(scale: LayerRectScale) {
    this._scale = createScale(undefined, this.scale, scale)
    this.rectLayer.setScale(this.scale)
    this.lineLayer.setScale(this.scale)
  }

  setStyle(style: LayerCandleStyle) {
    this._style = createStyle(defaultStyle, this.style, style)
  }

  update() {
    if (!this.data) return

    const {rawTableList} = this.data,
      {rect, line, negativeColor, positiveColor} = this.style,
      colors = rawTableList.map(([, start, end]) => (end >= start ? positiveColor : negativeColor))

    this.rectLayer.setStyle(merge({rect: {fill: colors}}, rect))
    this.lineLayer.setStyle(merge({rect: {fill: colors}}, line))

    this.rectLayer.update()
    this.lineLayer.update()

    this._scale = merge({}, this.lineLayer.scale)
  }

  draw() {
    this.lineLayer.draw()
    this.rectLayer.draw()
  }

  setVisible(visible: boolean, sublayer?: string) {
    this.rectLayer.setVisible(visible, sublayer)
    this.lineLayer.setVisible(visible, sublayer)
  }

  playAnimation() {
    this.rectLayer.playAnimation()
    this.lineLayer.playAnimation()
  }

  setAnimation(options: CacheAnimationOptions) {
    this.rectLayer.setAnimation(options)
    this.lineLayer.setAnimation(options)
  }
}
