import {merge} from 'lodash'
import {DataBase} from '../../data'
import {
  DrawerData,
  LayerOptions,
  LayerStyle,
  LayerTextStyle,
  TextDrawerProps,
} from '../../types'
import {getAttr, getTextWidth, group} from '../../utils'
import {LayerBase} from '../base'
import {createData, createStyle, createText} from '../helpers'

const defaultStyle: LayerTextStyle = {
  groupText: [],
  sanger: [1, 1],
  text: {
    fontSize: 16,
  },
}

export class LayerText extends LayerBase<'text'> {
  private _data: Maybe<
    DataBase<
      | string
      | (
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

  private textData: (DrawerData<TextDrawerProps> & {
    xIndex: number
    yIndex: number
  })[] = []

  get data() {
    return this._data
  }

  get style() {
    return this._style
  }

  constructor(options: LayerOptions) {
    super({options, sublayers: ['text']})
  }

  setData(data: LayerText['data']) {
    this._data = createData('base', this.data, data)
  }

  setStyle(style: LayerStyle<LayerTextStyle>) {
    this._style = createStyle(this.options, defaultStyle, this.style, style)
  }

  update() {
    if (!this.data) {
      throw new Error('Invalid data')
    }

    const {groupText, text, sanger} = this.style,
      {left, top, width, height} = this.options.layout,
      unitWidth = width / sanger[1],
      unitHeight = height / sanger[0]

    this.textData = group(this.data.source).map((item, i) => {
      const value = typeof item === 'string' ? item : item.text,
        xIndex = typeof item === 'string' ? 0 : item.x,
        yIndex = typeof item === 'string' ? 0 : item.y,
        style = merge({}, text, groupText[yIndex]),
        fontSize = getAttr(style.fontSize, i, 12),
        align = getAttr(style.align, 0, 'start'),
        verticalAlign = getAttr(style.align, 1, 'start')
      let x = left + unitWidth * yIndex,
        y = top + unitHeight * xIndex

      if (align === 'start') {
        x += 0
      } else if (align === 'center') {
        x += (unitWidth - getTextWidth(value, fontSize)) / 2
      } else if (align === 'end') {
        x += unitWidth - getTextWidth(value, fontSize)
      }

      if (verticalAlign === 'start') {
        y += fontSize
      } else if (verticalAlign === 'center') {
        y += (unitHeight + fontSize) / 2
      } else if (verticalAlign === 'end') {
        y += unitHeight
      }

      return {
        ...createText({x, y, value, style}),
        xIndex,
        yIndex,
      }
    })
  }

  draw() {
    const textData = this.textData.map((item) => ({
      data: [item],
      ...this.style.text,
      ...this.style.groupText[item.yIndex],
    }))

    this.drawBasic({type: 'text', key: 'text', data: textData})
  }
}
