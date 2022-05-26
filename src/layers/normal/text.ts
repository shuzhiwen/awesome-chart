import {LayerBase} from '../base'
import {getAttr, getTextWidth} from '../../utils'
import {createStyle, createText, validateAndCreateData} from '../helpers'
import {DataBase} from '../../data'
import {
  ChartContext,
  DrawerDataShape,
  LayerTextOptions,
  LayerTextStyleShape,
  TextDrawerProps,
} from '../../types'

const defaultStyle: LayerTextStyleShape = {
  align: 'start',
  verticalAlign: 'start',
  text: {
    fontSize: 12,
  },
}

export class LayerText extends LayerBase<LayerTextOptions> {
  private _data: Maybe<DataBase<string>>

  private _style = defaultStyle

  private textData: DrawerDataShape<TextDrawerProps>[] = []

  get data() {
    return this._data
  }

  get style() {
    return this._style
  }

  constructor(options: LayerTextOptions, context: ChartContext) {
    super({options, context, sublayers: ['text']})
  }

  setData(data: LayerText['data']) {
    this._data = validateAndCreateData('base', this.data, data)
  }

  setScale() {}

  setStyle(style: LayerTextStyleShape) {
    this._style = createStyle(defaultStyle, this._style, style)
  }

  update() {
    if (!this.data) {
      throw new Error('Invalid data')
    }

    const {align, verticalAlign, text} = this._style
    const {left, top, width, height} = this.options.layout
    const fontSize = getAttr(text?.fontSize, 0, 12)
    let [x, y] = [0, 0]

    if (align === 'start') {
      x = left
    } else if (align === 'middle') {
      x = left + (width - getTextWidth(this.data.source, fontSize)) / 2
    } else if (align === 'end') {
      x = left + width - getTextWidth(this.data.source, fontSize)
    }

    if (verticalAlign === 'start') {
      y = top + fontSize
    } else if (verticalAlign === 'middle') {
      y = top + (height + fontSize) / 2
    } else if (verticalAlign === 'end') {
      y = top + height
    }

    this.textData = [createText({x, y, value: this.data.source, style: text})]
  }

  draw() {
    const textData = {
      data: this.textData,
      ...this.style.text,
    }

    this.drawBasic({type: 'text', data: [textData]})
  }
}
