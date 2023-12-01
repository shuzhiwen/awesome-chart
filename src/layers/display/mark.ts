import {DataTableList} from '../../data'
import {
  DrawerData,
  LayerMarkScale,
  LayerMarkStyle,
  LayerOptions,
  LayerStyle,
  PathDrawerProps,
  TextDrawerProps,
} from '../../types'
import {createDroplet, isScaleBand, tableListToObjects} from '../../utils'
import {LayerBase} from '../base'
import {
  checkColumns,
  createData,
  createScale,
  createStyle,
  createText,
} from '../helpers'

type Key = 'mark' | 'text'

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

export class LayerMark extends LayerBase<Key> {
  private _scale: LayerMarkScale

  private _data: Maybe<DataTableList>

  private _style = defaultStyle

  protected textData: DrawerData<TextDrawerProps>[] = []

  protected markData: Required<DrawerData<PathDrawerProps> & {value: Meta}>[] =
    []

  get data() {
    return this._data
  }

  get scale() {
    return this._scale
  }

  get style() {
    return this._style
  }

  constructor(options: LayerOptions) {
    super({options, sublayers: ['mark', 'text']})
  }

  setData(data: LayerMark['data']) {
    this._data = createData('tableList', this.data, data)
    checkColumns(this.data, ['x', 'y'])
  }

  setScale(scale: LayerMarkScale) {
    this._scale = createScale(undefined, this.scale, scale)
  }

  setStyle(style: LayerStyle<LayerMarkStyle>) {
    this._style = createStyle(this.options, defaultStyle, this.style, style)
  }

  update() {
    if (!this.data || !this.scale) {
      throw new Error('Invalid data or scale')
    }

    const {size, text} = this.style,
      {scaleX, scaleY} = this.scale,
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
      createText({
        position: 'center',
        x: centerX,
        y: centerY - size / 10,
        value,
        style: text,
      })
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

    this.drawBasic({type: 'path', key: 'mark', data: [pathData]})
    this.drawBasic({type: 'text', key: 'text', data: [textData]})
  }
}
