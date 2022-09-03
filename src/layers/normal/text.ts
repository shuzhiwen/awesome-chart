import {merge} from 'lodash'
import {LayerBase} from '../base'
import {getAttr, getTextWidth, group} from '../../utils'
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
  sanger: [1, 1],
  text: {
    fontSize: 12,
  },
}

export class LayerText extends LayerBase<LayerTextOptions> {
  private _data: Maybe<
    DataBase<
      (
        | string
        | {
            text: string
            x: number
            y: number
          }
      )[]
    >
  >

  private _style = defaultStyle

  private textData: (DrawerDataShape<TextDrawerProps> & {
    xIndex: number
    yIndex: number
  })[] = []

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

    const {groupText, text, sanger = [1, 1]} = this.style,
      {left, top, width, height} = this.options.layout,
      unitWidth = width / sanger[1],
      unitHeight = height / sanger[0]

    this.textData = group(this.data.source).map((item, i) => {
      const value = typeof item === 'string' ? item : item.text,
        xIndex = typeof item === 'string' ? 0 : item.x,
        yIndex = typeof item === 'string' ? 0 : item.y,
        style = merge({}, text, groupText?.[yIndex]),
        fontSize = getAttr(style.fontSize, i, 12),
        _align = getAttr(style.align, i, 'start'),
        _verticalAlign = getAttr(style.verticalAlign, i, 'start')
      let x = left + unitWidth * yIndex,
        y = top + unitHeight * xIndex

      if (_align === 'start') {
        x += 0
      } else if (_align === 'middle') {
        x += (unitWidth - getTextWidth(value, fontSize)) / 2
      } else if (_align === 'end') {
        x += unitWidth - getTextWidth(value, fontSize)
      }

      if (_verticalAlign === 'start') {
        y += fontSize
      } else if (_verticalAlign === 'middle') {
        y += (unitHeight + fontSize) / 2
      } else if (_verticalAlign === 'end') {
        y += unitHeight
      }

      return {
        ...createText({x, y, value, style: style}),
        xIndex,
        yIndex,
      }
    })
  }

  draw() {
    const textData = this.textData.map((item) => ({
      data: [item],
      ...this.style.text,
      ...this.style.groupText?.[item.yIndex],
    }))

    this.drawBasic({type: 'text', data: textData})
  }
}
