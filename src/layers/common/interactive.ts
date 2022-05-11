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
  LayerInteractiveOptions,
} from '../../types'
import {LayerAuxiliary} from './auxiliary'
import {isScaleLinear, uuid} from '../../utils'

const defaultStyle: LayerInteractiveStyleShape = {
  line: {
    stroke: 'yellow',
  },
}

export class LayerInteractive extends LayerBase<LayerInteractiveOptions> {
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

  constructor(options: LayerInteractiveOptions, context: ChartContext) {
    super({context, options, sublayers: ['rect']})
    const {layout, createSublayer, event} = this.options

    this.event.on('destroy', () => {
      this.helperAuxiliary.forEach((auxiliary) => auxiliary.destroy())
    })

    this.helperAuxiliary = [
      createSublayer({
        id: uuid(),
        layout,
        type: 'auxiliary',
        direction: 'vertical',
      }),
      createSublayer({
        id: uuid(),
        layout,
        type: 'auxiliary',
        direction: 'horizontal',
      }),
    ] as LayerInteractive['helperAuxiliary']

    this.helperAuxiliary[0].setStyle({labelPosition: 'top'})
    this.helperAuxiliary[1].setStyle({labelPosition: 'right'})

    event.on('MouseEvent', ({event}: {event: MouseEvent}) => {
      const {offsetX, offsetY} = event,
        {scaleX, scaleY} = this.scale,
        {left, right, top, bottom} = layout,
        [helperAuxiliaryX, helperAuxiliaryY] = this.helperAuxiliary
      let x: Maybe<number>, y: Maybe<number>

      if (offsetX < left || offsetX > right || offsetY < top || offsetY > bottom) {
        helperAuxiliaryX.setVisible(false)
        helperAuxiliaryY.setVisible(false)
        return
      }

      if (isScaleLinear(scaleX)) {
        x = scaleX.invert(offsetX - left)
        helperAuxiliaryX.setVisible(true)
        helperAuxiliaryX.setData(
          new DataTableList([
            ['label', 'value'],
            ['helperAuxiliaryX', Number(x).toFixed(2)],
          ])
        )
        helperAuxiliaryX.draw()
      }

      if (isScaleLinear(scaleY)) {
        y = scaleY.invert(offsetY - top)
        helperAuxiliaryY.setVisible(true)
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
