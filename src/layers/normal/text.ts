import {LayerBase} from '../base'
import {createEvent, createLog, getAttr, getTextWidth} from '../../utils'
import {BackupValueShape, ChartContext, LayerOptions, TextLayerStyleShape} from '../../types'
import {Custom} from '../../data'

const defaultStyle: TextLayerStyleShape = {
  align: 'start',
  verticalAlign: 'start',
  text: {
    fontSize: 12,
  },
}

export class LayerText extends LayerBase {
  readonly className = 'awesome-text'

  readonly event = createEvent('layer:normal:text')

  readonly log = createLog('layer:normal:text', 'TextLayer')

  private _data: Maybe<Custom> = null

  private _style = defaultStyle

  private textData: BackupValueShape<{
    value: string
    x: number
    y: number
  }> = []

  get data() {
    return this._data
  }

  get style() {
    return this._style
  }

  constructor(options: LayerOptions, context: ChartContext) {
    super({options, context, sublayers: ['text']})
  }

  // data is string
  setData(data: Custom) {
    this._data = this.validateAndCreateData('base', this.data, data)
  }

  setStyle(style: TextLayerStyleShape) {
    if (!this.data?.source) {
      return
    }

    this._style = this.createStyle(defaultStyle, this._style, style)
    const {align, verticalAlign, text} = this._style
    const {left, top, width, height} = this.options.layout
    const fontSize = getAttr(text?.fontSize, 0)
    let [x, y] = [0, 0]

    // horizontal position
    if (align === 'start') {
      x = left
    } else if (align === 'middle') {
      x = left + (width - getTextWidth(this.data.source, fontSize)) / 2
    } else if (align === 'end') {
      x = left + width - getTextWidth(this.data.source, fontSize)
    }
    // vertical position
    if (verticalAlign === 'start') {
      y = top + fontSize
    } else if (verticalAlign === 'middle') {
      y = top + (height + fontSize) / 2
    } else if (verticalAlign === 'end') {
      y = top + height
    }

    const textData = this.createText({x, y, value: this.data.source, style: text})
    this.textData = [{data: [textData]}]
  }

  draw() {
    this.drawBasic({type: 'text', data: this.textData})
  }
}
