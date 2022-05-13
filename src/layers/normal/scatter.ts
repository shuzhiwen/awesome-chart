import {LayerBase} from '../base'
import {
  createColorMatrix,
  createScale,
  createStyle,
  createText,
  validateAndCreateData,
} from '../helpers'
import {DataTableList} from '../../data'
import {scaleLinear} from '../../scales'
import {ungroup} from '../../utils'
import {
  ChartContext,
  DrawerDataShape,
  LayerScatterOptions,
  LayerScatterStyleShape,
  LayerScatterScaleShape,
  TextDrawerProps,
  LegendDataShape,
} from '../../types'

const defaultStyle: LayerScatterStyleShape = {
  pointSize: [5, 5],
}

export class LayerScatter extends LayerBase<LayerScatterOptions> {
  public legendData: Maybe<LegendDataShape>

  private needRescale = false

  private _data: Maybe<DataTableList>

  private _scale: LayerScatterScaleShape

  private _style = defaultStyle

  private textData: DrawerDataShape<TextDrawerProps>[][] = []

  private pointData: {
    x: number
    y: number
    r: number
    value: Meta
    color: string
    source: AnyObject
    category: Meta
  }[][] = []

  get scale() {
    return this._scale!
  }

  get data() {
    return this._data!
  }

  get style() {
    return this._style!
  }

  constructor(options: LayerScatterOptions, context: ChartContext) {
    super({options, context, sublayers: ['point', 'text'], tooltipTargets: ['point']})
  }

  setData(data: LayerScatter['data']) {
    this._data = validateAndCreateData('tableList', this.data, data)
    this.needRescale = true

    const {headers} = this.data

    ;['x', 'y'].map((key) => {
      if (!headers.includes(key)) {
        this.log.error(`DataTableList 缺失必须列 "${key}"`)
      }
    })
  }

  setScale(scale: LayerScatterScaleShape) {
    this._scale = createScale(undefined, this.scale, scale)
    this.needRescale = false
  }

  setStyle(style: LayerScatterStyleShape) {
    this._style = createStyle(defaultStyle, this.style, style)
  }

  update() {
    this.needRescale && this.createScale()

    const {layout} = this.options,
      {top, left} = layout,
      {scaleX, scaleY, scalePointSize} = this.scale,
      {text, point, pointSize} = this.style,
      {headers, rawTableList} = this.data,
      xIndex = headers.findIndex((header) => header === 'x'),
      yIndex = headers.findIndex((header) => header === 'y'),
      valueIndex = headers.findIndex((header) => header === 'value'),
      categoryIndex = headers.findIndex((header) => header === 'category'),
      pointData = rawTableList.map((item, i) => ({
        value: item[valueIndex],
        category: item[categoryIndex],
        x: left + scaleX(item[xIndex] as number) ?? NaN,
        y: top + scaleY(item[yIndex] as number) ?? NaN,
        r: scalePointSize(item[valueIndex] as number) ?? ungroup(pointSize),
        source: headers.map((header, j) => ({
          value: rawTableList[i][j],
          category: header,
        })),
      })),
      categories = Array.from(new Set(pointData.map(({category}) => category))),
      colorMatrix = createColorMatrix({
        layer: this,
        row: 1,
        column: categories.length,
        theme: point?.fill,
      })

    this.pointData = categories.map((category, i) =>
      pointData
        .filter((item) => item.category === category && item.x && item.y)
        .map((item) => ({...item, color: colorMatrix.get(0, i)}))
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
      filter: 'column',
      legends: this.pointData.map((group, i) => ({
        shape: 'circle',
        label: group.at(0)?.category ?? '',
        color: colorMatrix.get(0, i),
      })),
    }
  }

  private createScale() {
    this.needRescale = false

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
          domain: this.data.select('value').range(),
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
