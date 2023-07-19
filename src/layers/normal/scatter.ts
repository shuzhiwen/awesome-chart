import {DataTableList} from '../../data'
import {scaleLinear} from '../../scales'
import {
  ChartContext,
  CircleDrawerProps,
  DrawerData,
  ElSource,
  LayerScatterOptions,
  LayerScatterScale,
  LayerScatterStyle,
  LayerStyle,
  LegendData,
  TextDrawerProps,
} from '../../types'
import {isRealNumber, tableListToObjects, ungroup} from '../../utils'
import {LayerBase} from '../base'
import {
  checkColumns,
  createColorMatrix,
  createScale,
  createStyle,
  createText,
  validateAndCreateData,
} from '../helpers'

type DataKey = 'x' | 'y' | 'value' | 'category'

const defaultStyle: LayerScatterStyle = {
  pointSize: [5, 5],
}

export class LayerScatter extends LayerBase<LayerScatterOptions> {
  public legendData: Maybe<LegendData>

  private _data: Maybe<DataTableList>

  private _scale: LayerScatterScale

  private _style = defaultStyle

  private textData: DrawerData<TextDrawerProps>[][] = []

  private pointData: (DrawerData<CircleDrawerProps> & {
    value: Meta
    color: string
    category: Meta
    source: ElSource[]
  })[][] = []

  get scale() {
    return this._scale
  }

  get data() {
    return this._data
  }

  get style() {
    return this._style
  }

  constructor(options: LayerScatterOptions, context: ChartContext) {
    super({options, context, sublayers: ['point', 'text'], interactive: ['point']})
  }

  setData(data: LayerScatter['data']) {
    this._data = validateAndCreateData('tableList', this.data, data)
    this.createScale()

    checkColumns(this.data, ['x', 'y'])
  }

  setScale(scale: LayerScatterScale) {
    this._scale = createScale(undefined, this.scale, scale)
  }

  setStyle(style: LayerStyle<LayerScatterStyle>) {
    this._style = createStyle(this.options, defaultStyle, this.style, style)
  }

  update() {
    if (!this.data || !this.scale) {
      throw new Error('Invalid data or scale')
    }

    const {top, left} = this.options.layout,
      {source, headers, rawTableList} = this.data,
      {scaleX, scaleY, scalePointSize} = this.scale,
      {text, point, pointSize} = this.style,
      data = tableListToObjects<DataKey>(source),
      pointData = data.map((item, i) => ({
        value: item.value,
        category: item.category,
        x: left + scaleX(item.x as number) ?? NaN,
        y: top + scaleY(item.y as number) ?? NaN,
        r: scalePointSize(item.value as number) ?? ungroup(pointSize),
        source: headers.map((header, j) => ({
          value: rawTableList[i][j],
          category: header,
        })),
      })),
      categories = Array.from(new Set(pointData.map(({category}) => category))),
      colorMatrix = createColorMatrix({
        layer: this,
        row: categories.length,
        column: 1,
        theme: point?.fill,
      })

    this.pointData = categories.map((_category, i) =>
      pointData
        .map((item) => ({...item, color: colorMatrix.get(i, 0)}))
        .filter(({category, x, y}) => {
          return category === _category && isRealNumber(x) && isRealNumber(y)
        })
    )

    this.textData = this.pointData.map((group) =>
      group.map((item) =>
        createText({
          ...item,
          position: 'center',
          style: text,
        })
      )
    )

    this.legendData = {
      colorMatrix,
      filter: 'row',
      legends: this.pointData.map((group, i) => ({
        shape: 'circle',
        label: group[0]?.category,
        color: colorMatrix.get(i, 0),
      })),
    }
  }

  private createScale() {
    if (!this.data) return

    const {layout} = this.options,
      {width, height} = layout,
      {pointSize} = this.style

    this._scale = createScale(
      {
        scaleX: scaleLinear({
          domain: this.data.select('x').range(),
          range: [0, width],
        }),
        scaleY: scaleLinear({
          domain: this.data.select('y').range(),
          range: [height, 0],
        }),
        scalePointSize: scaleLinear({
          domain: this.data.headers.includes('value')
            ? this.data.select('value').range()
            : [Infinity, Infinity],
          range: pointSize!,
        }),
      },
      this.scale
    )
  }

  draw() {
    const textData = this.textData.map((group) => ({
      data: group,
      ...this.style.text,
    }))
    const pointData = this.pointData.map((group) => ({
      data: group,
      source: group.map(({source}) => source),
      ...this.style.point,
      fill: group.map(({color}) => color),
    }))

    this.drawBasic({type: 'circle', data: pointData, sublayer: 'point'})
    this.drawBasic({type: 'text', data: textData})
  }
}
