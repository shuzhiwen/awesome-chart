import {LayerBase} from '../base'
import {DataTableList} from '../../data'
import {createScale, createStyle, validateAndCreateData} from '../helpers'
import {
  ChartContext,
  LayerInteractiveStyleShape,
  DrawerDataShape,
  LegendDataShape,
  LayerAxisScaleShape,
  RectDrawerProps,
  LayerOptions,
} from '../../types'
import {LayerAuxiliary} from './auxiliary'
import {isScaleLinear, uuid} from '../../utils'

const defaultStyle: LayerInteractiveStyleShape = {
  line: {
    stroke: 'yellow',
  },
}

export class LayerInteractive extends LayerBase {
  public legendData: Maybe<LegendDataShape>

  private _data: Maybe<DataTableList>

  private _scale: LayerAxisScaleShape

  private _style = defaultStyle

  private rectData: DrawerDataShape<RectDrawerProps>[] = []

  private helperAuxiliary: [LayerAuxiliary, LayerAuxiliary]

  get scale() {
    return this._scale!
  }

  get data() {
    return this._data!
  }

  get style() {
    return this._style!
  }

  constructor(options: LayerOptions, context: ChartContext) {
    super({context, options, sublayers: ['rect']})
    const {layout, createSublayer, registerFocusListener} = this.options

    this.helperAuxiliary = [
      createSublayer('auxiliary', {
        id: uuid(),
        layout,
        direction: 'vertical',
      }),
      createSublayer('auxiliary', {
        id: uuid(),
        layout,
        direction: 'horizontal',
      }),
    ] as LayerInteractive['helperAuxiliary']

    registerFocusListener(({offsetX, offsetY}) => {
      const {scaleX, scaleY} = this.scale,
        [helperAuxiliaryX, helperAuxiliaryY] = this.helperAuxiliary
      let x: Maybe<number>, y: Maybe<number>

      if (isScaleLinear(scaleX)) {
        x = scaleX.invert(offsetX) + layout.left
        helperAuxiliaryX.setData(
          new DataTableList([
            ['label', 'value'],
            ['helperAuxiliaryX', Number(x).toFixed(2)],
          ])
        )
        helperAuxiliaryX.draw()
      }

      if (isScaleLinear(scaleY)) {
        y = scaleY.invert(offsetY) + layout.top
        helperAuxiliaryY.setData(
          new DataTableList([
            ['label', 'value'],
            ['helperAuxiliaryY', Number(y).toFixed(2)],
          ])
        )
        helperAuxiliaryY.draw()
      }
    })
  }

  setData(data: LayerInteractive['data']) {
    this._data = validateAndCreateData('base', this.data, data)
  }

  setScale(scale: LayerAxisScaleShape) {
    this._scale = createScale(undefined, this.scale, scale)
    this.helperAuxiliary.map((layer) => layer.setScale(this.scale))
  }

  setStyle(style: LayerInteractiveStyleShape) {
    this._style = createStyle(defaultStyle, this.style, style)
    this.helperAuxiliary.map((layer) => layer.setStyle(this.style))
  }

  update() {}

  draw() {
    const interactiveData = {
      data: this.rectData,
      ...this.style.interactive,
    }

    this.drawBasic({type: 'rect', data: [interactiveData]})
  }
}
