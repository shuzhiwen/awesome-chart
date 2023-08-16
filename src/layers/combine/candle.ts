import {merge} from 'lodash'
import {commonEvents} from '../../core'
import {DataTableList} from '../../data'
import {
  ChartContext,
  LayerCandleOptions,
  LayerCandleStyle,
  LayerRectScale,
  LayerStyle,
  LegendData,
} from '../../types'
import {bindEventManager, uuid} from '../../utils'
import {LayerBase} from '../base'
import {createScale, createStyle, validateAndCreateData} from '../helpers'
import {LayerRect} from '../normal'

type Key = 'rect' | 'text'

const defaultStyle: LayerCandleStyle = {
  positiveColor: 'red',
  negativeColor: 'green',
  rect: {
    background: {hidden: true},
    text: {hidden: true},
  },
  line: {
    fixedWidth: '20%',
    background: {hidden: true},
    text: {hidden: true},
  },
}

export class LayerCandle extends LayerBase<LayerCandleOptions, Key> {
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
    super({context, options})
    const {layout, createSublayer} = this.options

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

    bindEventManager(this.event, [this.lineLayer.event, this.rectLayer.event], (name) =>
      Array.from(commonEvents.values()).some((item) => name.match(item))
    )
  }

  setData(data: LayerCandle['data']) {
    this._data = validateAndCreateData('tableList', this.data, data, (data) => {
      if (!data) return

      const {headers} = data

      data.sort({mode: 'asc', targets: 'dimension', variant: 'date'})

      this.rectLayer.setData(data.select(headers.slice(0, 3)))
      this.lineLayer.setData(data.select([headers[0], headers[3], headers[4]]))
    })
  }

  setScale(scale: LayerRectScale) {
    this._scale = createScale(undefined, this.scale, scale)
    this.rectLayer.setScale(this.scale)
    this.lineLayer.setScale(this.scale)
  }

  setStyle(style: LayerStyle<LayerCandleStyle>) {
    this._style = createStyle(this.options, defaultStyle, this.style, style)
  }

  update() {
    if (!this.data) return

    const {rawTableList} = this.data,
      {rect, line, negativeColor, positiveColor} = this.style,
      colors = rawTableList.map(([, start, end]) => {
        return end >= start ? positiveColor : negativeColor
      })

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

  setVisible(visible: boolean, sublayer?: Key) {
    this.rectLayer.setVisible(visible, sublayer)
    this.lineLayer.setVisible(visible, sublayer)
  }

  playAnimation() {
    this.rectLayer.playAnimation()
    this.lineLayer.playAnimation()
  }

  setAnimation(options: Parameters<LayerBase<any, Key>['setAnimation']>[0]) {
    this.rectLayer.setAnimation(options)
    this.lineLayer.setAnimation(options)
  }
}
