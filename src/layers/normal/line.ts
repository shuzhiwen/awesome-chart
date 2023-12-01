import {DataTableList} from '../../data'
import {scaleBand, scaleLinear} from '../../scales'
import {
  AreaDrawerProps,
  CircleDrawerProps,
  DrawerData,
  LayerLineScale,
  LayerLineStyle,
  LayerOptions,
  LayerStyle,
  LegendData,
  SourceMeta,
  TextDrawerProps,
} from '../../types'
import {errorCatcher, isRealNumber} from '../../utils'
import {LayerBase} from '../base'
import {
  createColorMatrix,
  createData,
  createScale,
  createStyle,
  createText,
} from '../helpers'

type Key = 'text' | 'curve' | 'point' | 'area'

const defaultStyle: LayerLineStyle = {
  mode: 'cover',
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
    fillOpacity: 0.5,
  },
}

export class LayerLine extends LayerBase<Key> {
  public legendData: Maybe<LegendData>

  private _data: Maybe<DataTableList>

  private _scale: LayerLineScale

  private _style = defaultStyle

  protected textData: DrawerData<TextDrawerProps>[][] = []

  protected pointData: (DrawerData<CircleDrawerProps> & {
    value: Meta
    meta: SourceMeta
    color: string
  })[][] = []

  protected areaData: (ArrayItem<DrawerData<AreaDrawerProps>['lines']> & {
    color: string
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

  constructor(options: LayerOptions) {
    super({
      options,
      sublayers: ['text', 'curve', 'point', 'area'],
      interactive: ['point'],
    })
    this.createScale = errorCatcher(this.createScale.bind(this), () => {
      this.log.warn('Create scale failed')
    })
  }

  setData(data: LayerLine['data']) {
    this._data = createData('tableList', this.data, data)
    this.createScale()
  }

  setScale(scale: LayerLineScale) {
    this._scale = createScale(undefined, this.scale, scale)
  }

  setStyle(style: LayerStyle<LayerLineStyle>) {
    this._style = createStyle(this.options, defaultStyle, this.style, style)
    this.createScale()
  }

  update() {
    if (!this.data || !this.scale) {
      throw new Error('Invalid data or scale')
    }

    const {scaleX, scaleY} = this.scale,
      {height, top, left} = this.options.layout,
      {mode, labelPosition, pointSize, text, curve} = this.style,
      {headers, rawTableList} = this.data,
      colorMatrix = createColorMatrix({
        layer: this,
        row: 1,
        column: rawTableList[0].length - 1,
        theme: curve.stroke,
      })

    this.pointData = rawTableList.map(([dimension, ...values]) =>
      values.map((value, i) => ({
        value,
        x: left + (scaleX(dimension as string) || 0) + scaleX.bandwidth() / 2,
        y: isRealNumber(value) ? top + scaleY(value) : NaN,
        r: pointSize / 2,
        meta: {dimension, category: headers[i + 1], value},
        color: colorMatrix.get(0, i),
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
      group.map((datum) =>
        createText({
          ...datum,
          position: labelPosition,
          style: text,
          offset: 5,
        })
      )
    )

    this.areaData = this.pointData.map((group, i) =>
      group.map(({y, ...item}, j) => ({
        ...item,
        y2:
          mode === 'stack' && j !== 0
            ? this.pointData[i][j - 1].y
            : height + top,
        y1: y,
      }))
    )

    this.legendData = {
      colorMatrix,
      filter: 'column',
      legends: headers.slice(1).map((header, i) => ({
        label: header,
        shape: 'brokenLine',
        color: colorMatrix.get(0, i),
      })),
    }
  }

  private createScale() {
    if (!this.data) return

    const {layout} = this.options,
      {width, height} = layout,
      {headers} = this.data,
      {mode} = this.style

    this._scale = createScale(
      {
        scaleX: scaleBand({
          domain: this.data.select(headers[0]).lists[0] as string[],
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

  private fallbackFilter<T extends {y?: number; y1?: number; y2?: number}>(
    position: T[]
  ) {
    if (!this.scale) return []

    const {layout} = this.options,
      {fallback} = this.style,
      {scaleY} = this.scale

    if (fallback === 'break') {
      return position.reduce<T[][]>(
        (prev, cur) =>
          cur.y || cur.y1
            ? [
                ...prev.slice(0, prev.length - 1),
                [...prev[prev.length - 1], cur],
              ]
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
      return [
        position.filter((item) => {
          return isRealNumber(item.y) || isRealNumber(item.y1)
        }),
      ]
    }

    return []
  }

  draw() {
    const areaData = this.areaData[0].map(({color}, index) => ({
      data: this.fallbackFilter(this.areaData.map((item) => item[index])).map(
        (lines) => ({
          curve: this.style.curveType,
          lines,
        })
      ),
      ...this.style.area,
      fill: color,
    }))
    const curveData = this.pointData[0].map(({color}, index) => ({
      data: this.fallbackFilter(this.pointData.map((item) => item[index])).map(
        (points) => ({
          curve: this.style.curveType,
          points,
        })
      ),
      ...this.style.curve,
      stroke: color,
    }))
    const textData = this.textData.map((group) => ({
      data: group.filter(({y}) => isRealNumber(y)),
      ...this.style.text,
    }))
    const pointData = this.pointData.map((group) => ({
      data: group.filter(({y}) => isRealNumber(y)),
      ...this.style.point,
      stroke: group.map(({color}) => color),
    }))

    this.drawBasic({type: 'area', key: 'area', data: areaData})
    this.drawBasic({type: 'curve', key: 'curve', data: curveData})
    this.drawBasic({type: 'circle', key: 'point', data: pointData})
    this.drawBasic({type: 'text', key: 'text', data: textData})
  }
}
