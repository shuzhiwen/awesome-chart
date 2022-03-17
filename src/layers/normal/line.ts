import {isNumber} from 'lodash'
import {LayerBase} from '../base'
import {mergeAlpha, transpose} from '../../utils'
import {scaleBand, scaleLinear} from '../../scales'
import {DataTableList} from '../../data'
import {
  createColorMatrix,
  createScale,
  createStyle,
  createText,
  validateAndCreateData,
} from '../helpers'
import {
  ChartContext,
  LayerLineStyleShape,
  DrawerDataShape,
  TextDrawerProps,
  LayerLineOptions,
  LegendDataShape,
  GraphStyleShape,
  LayerNormalScaleShape,
} from '../../types'

const defaultStyle: LayerLineStyleShape = {
  fallback: 'break',
  labelPosition: 'top',
  curveType: 'curveMonotoneX',
  pointSize: 5,
  text: {
    offset: [0, 5],
  },
  curve: {
    strokeWidth: 2,
  },
  point: {
    fill: 'white',
    strokeWidth: 2,
  },
  area: {
    opacity: 0.3,
  },
}

export class LayerLine extends LayerBase {
  public legendData: LegendDataShape = {}

  private _data: Maybe<DataTableList>

  private _scale: LayerNormalScaleShape

  private _style = defaultStyle

  private textData: DrawerDataShape<TextDrawerProps>[][] = []

  private pointData: {
    x: number
    y: number
    r: number
    value: Meta
    source: AnyObject
    color: string
    pointSize: number
  }[][] = []

  private areaData: {
    x: number
    y1: number
    y2: number
    fill: GraphStyleShape['fill']
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

  constructor(options: LayerLineOptions, context: ChartContext) {
    super({
      options,
      context,
      sublayers: ['text', 'curve', 'point', 'area'],
      tooltipTargets: ['point'],
    })
  }

  setData(data: LayerLine['data']) {
    this._data = validateAndCreateData('base', this.data, data)
  }

  setScale(scale: LayerNormalScaleShape) {
    this._scale = createScale(undefined, this.scale, scale)
  }

  setStyle(style: LayerLineStyleShape) {
    this._style = createStyle(defaultStyle, this.style, style)
  }

  update() {
    this.createScale()

    const {layout, mode, createGradient} = this.options,
      {height, top, left} = layout,
      {scaleX, scaleY} = this.scale,
      {labelPosition, pointSize, text, curve} = this.style,
      headers = this.data.data.map(({header}) => header),
      rawTableList = transpose(this.data.data.map(({list}) => list)),
      colorMatrix = createColorMatrix({
        layer: this,
        row: 1,
        column: this.pointData[0]?.length,
        theme: curve?.stroke,
      })

    this.pointData = rawTableList.map(([dimension, ...values]) =>
      values.map((value, i) => ({
        value,
        x: left + (scaleX(dimension as string) || 0) + scaleX.bandwidth() / 2,
        y: isNumber(value) ? top + scaleY(value) : top + height,
        r: defaultStyle.pointSize / 2,
        source: {dimension, category: headers[i + 1], value},
        color: colorMatrix.get(0, i),
        pointSize: pointSize / 2,
      }))
    )

    if (mode === 'stack') {
      this.pointData.forEach((group) => {
        group.forEach((item, i) => {
          i !== 0 && (item.y = group[i - 1].y - (scaleY(0) + top - item.y))
        })
      })
    }

    this.textData = this.pointData.map((group) =>
      group.map(({value, x, y}) =>
        createText({x, y, value, position: labelPosition, style: text, offset: 5})
      )
    )

    this.areaData = this.pointData.map((group, i) =>
      group.map(({y, color = 'rgb(255,255,255)', ...item}, j) => ({
        y1: y,
        y2: mode === 'stack' && j !== 0 ? this.pointData[i][j - 1].y : height + top,
        fill: (!i &&
          createGradient({
            type: 'linear',
            direction: 'vertical',
            colors: [color, mergeAlpha(color, 0)],
          })) as string,
        ...item,
      }))
    )

    this.legendData = {
      colorMatrix,
      filter: 'column',
      legends: this.data.data.slice(1).map(({header}, i) => ({
        label: header,
        shape: 'broken-line',
        color: colorMatrix.get(0, i),
      })),
    }
  }

  private createScale() {
    const {layout, mode} = this.options,
      {width, height} = layout,
      headers = this.data.data.map(({header}) => header)

    this._scale = createScale(
      {
        scaleX: scaleBand({
          domain: this.data.select(headers[0]).data[0].list as string[],
          range: [0, width],
        }),
        scaleY: scaleLinear({
          domain: this.data
            .select(headers.slice(1), {mode: mode === 'stack' ? 'sum' : 'copy'})
            .range(),
          range: [height, 0],
        }),
      },
      this.scale
    )
  }

  private fallbackFilter(position: {y?: number; y1?: number; y2?: number}[]) {
    const {layout} = this.options,
      {fallback} = this.style,
      scaleY = this.scale.scaleY as ReturnType<typeof scaleLinear>

    if (fallback === 'break') {
      return position.reduce<{y?: number; y1?: number; y2?: number}[][]>(
        (prev, cur) =>
          cur.y || cur.y1
            ? [...prev.slice(0, prev.length - 1), [...prev[prev.length - 1], cur]]
            : [...prev, []],
        [[]]
      )
    } else if (fallback === 'zero') {
      return [
        position.map((item) => ({
          ...item,
          y: item.y || scaleY(0) + layout.top,
          y1: item.y1 || item.y2 || scaleY(0) + layout.top,
        })),
      ]
    } else if (fallback === 'continue') {
      return [position.filter((item) => isNumber(item.y) || isNumber(item.y1))]
    }

    return []
  }

  draw() {
    const areaData = this.areaData[0].map(({fill}, index) => ({
      data: this.fallbackFilter(this.areaData.map((item) => item[index])).map((lines) => ({
        curve: this.style.curveType,
        lines,
      })),
      ...this.style.area,
      fill,
    }))
    const curveData = this.pointData[0].map(({color}, index) => ({
      data: this.fallbackFilter(this.pointData.map((item) => item[index])).map((points) => ({
        curve: this.style.curveType,
        points,
      })),
      ...this.style.curve,
      stroke: color,
    }))
    const textData = this.textData.map((group) => ({
      data: group,
      ...this.style.text,
    }))
    const pointData = this.pointData.map((group) => ({
      data: group,
      source: group.map(({source}) => source),
      ...this.style.point,
      stroke: group.map(({color}) => color),
    }))

    this.drawBasic({type: 'area', data: areaData})
    this.drawBasic({type: 'curve', data: curveData})
    this.drawBasic({type: 'circle', data: pointData, sublayer: 'point'})
    this.drawBasic({type: 'text', data: textData})
  }
}