import {LayerBase} from '../base'
import {checkColumns, createScale, createStyle, createText, validateAndCreateData} from '../helpers'
import {createDroplet, isScaleBand, tableListToObjects} from '../../utils'
import {DataTableList} from '../../data'
import {
  ChartContext,
  DrawerData,
  LayerMarkOptions,
  LayerMarkScale,
  LayerMarkStyle,
  LayerStyle,
  PathDrawerProps,
  TextDrawerProps,
} from '../../types'

type DataKey = 'x' | 'y' | 'value'

const defaultStyle: LayerMarkStyle = {
  size: 30,
  mark: {
    fill: 'red',
  },
  text: {
    fontSize: 8,
    fill: 'white',
  },
}

export class LayerMark extends LayerBase<LayerMarkOptions> {
  private _scale: LayerMarkScale

  private _data: Maybe<DataTableList>

  private _style = defaultStyle

  private textData: DrawerData<TextDrawerProps>[] = []

  private markData: Required<DrawerData<PathDrawerProps> & {value: Meta}>[] = []

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
    checkColumns(this.data, ['x', 'y'])
  }

  setScale(scale: LayerMarkScale) {
    this._scale = createScale(undefined, this.scale, scale)
  }

  setStyle(style: LayerStyle<LayerMarkStyle>) {
    this._style = createStyle(this.options, defaultStyle, this._style, style)
  }

  update() {
    if (!this.data || !this.scale) {
      throw new Error('Invalid data or scale')
    }

    const {scaleX, scaleY} = this.scale,
      {size = 10, text} = this.style,
      {left, top} = this.options.layout,
      data = tableListToObjects<DataKey>(this.data.source),
      offsetX = isScaleBand(scaleX) ? scaleX.bandwidth() / 2 : 0,
      offsetY = isScaleBand(scaleY) ? scaleY.bandwidth() / 2 : 0

    this.markData = data.map((item) => ({
      value: item.value ?? '',
      path: createDroplet(-size / 2, -size / 2, size, size),
      centerX: left + scaleX(item.x) + offsetX,
      centerY: top + scaleY(item.y) - size / 2 + offsetY,
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
