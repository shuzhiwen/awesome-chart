import {LayerBase} from '../base'
import {createScale, createStyle, createText, validateAndCreateData} from '../helpers'
import {DataTableList} from '../../data'
import {
  ChartContext,
  DrawerDataShape,
  LayerMarkOptions,
  LayerMarkScaleShape,
  LayerMarkStyleShape,
  PathDrawerProps,
  TextDrawerProps,
} from '../../types'
import {createDroplet, isScaleBand} from '../../utils'

const defaultStyle: LayerMarkStyleShape = {
  size: 30,
  mark: {
    fill: 'red',
  },
  text: {
    fontSize: 8,
  },
}

export class LayerMark extends LayerBase<LayerMarkOptions> {
  private _scale: LayerMarkScaleShape

  private _data: Maybe<DataTableList>

  private _style = defaultStyle

  private textData: DrawerDataShape<TextDrawerProps>[] = []

  private markData: Required<DrawerDataShape<PathDrawerProps> & {value: Meta}>[] = []

  get data() {
    return this._data
  }

  get scale() {
    return this._scale
  }

  get style() {
    return this._style
  }

  constructor(options: LayerMarkOptions, context: ChartContext) {
    super({options, context, sublayers: ['mark', 'text']})
  }

  setData(data: LayerMark['data']) {
    this._data = validateAndCreateData('tableList', this.data, data)
    ;['x', 'y'].map((key) => {
      if (!this.data?.headers.includes(key)) {
        throw new Error(`DataTableList lost specific column "${key}"`)
      }
    })
  }

  setScale(scale: LayerMarkScaleShape) {
    this._scale = createScale(undefined, this.scale, scale)
  }

  setStyle(style: LayerMarkStyleShape) {
    this._style = createStyle(defaultStyle, this._style, style)
  }

  update() {
    if (!this.data || !this.scale) {
      throw new Error('Invalid data or scale')
    }

    const {scaleX, scaleY} = this.scale,
      {headers, rawTableList} = this.data,
      {size = 10, text} = this.style,
      {left, top} = this.options.layout,
      xIndex = headers.findIndex((header) => header === 'x'),
      yIndex = headers.findIndex((header) => header === 'y'),
      valueIndex = headers.findIndex((header) => header === 'value'),
      offsetX = isScaleBand(scaleX) ? scaleX.bandwidth() / 2 : 0,
      offsetY = isScaleBand(scaleY) ? scaleY.bandwidth() / 2 : 0

    this.markData = rawTableList.map((item) => ({
      value: item[valueIndex] ?? '',
      path: createDroplet(-size / 2, -size / 2, size, size),
      centerX: left + scaleX(item[xIndex]) + offsetX,
      centerY: top + scaleY(item[yIndex]) - size / 2 + offsetY,
    }))

    this.textData = this.markData.map(({centerX, centerY, value}) =>
      createText({position: 'center', x: centerX, y: centerY - size / 10, value, style: text})
    )
  }

  draw() {
    const pathData = {
      data: this.markData,
      ...this.style.mark,
    }
    const textData = {
      data: this.textData,
      ...this.style.text,
    }

    this.drawBasic({type: 'path', data: [pathData], sublayer: 'mark'})
    this.drawBasic({type: 'text', data: [textData]})
  }
}
