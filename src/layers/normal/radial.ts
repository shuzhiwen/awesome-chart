import {LayerBase} from '../base'
import {isRealNumber} from '../../utils'
import {DataTableList} from '../../data'
import {createColorMatrix, createScale, createStyle, validateAndCreateData} from '../helpers'
import {scaleBand, scaleLinear} from '../../scales'
import {
  ChartContext,
  LayerRadialStyleShape,
  DrawerDataShape,
  TextDrawerProps,
  LayerRadialOptions,
  LegendDataShape,
  LayerRadialScaleShape,
  ElSourceShape,
  ArcDrawerProps,
} from '../../types'

const defaultStyle: LayerRadialStyleShape = {
  innerRadius: 10,
  cornerRadius: Infinity,
}

export class LayerRadial extends LayerBase<LayerRadialOptions> {
  public legendData: Maybe<LegendDataShape>

  private needRescale = false

  private _data: Maybe<DataTableList>

  private _scale: LayerRadialScaleShape

  private _style = defaultStyle

  private textData: DrawerDataShape<TextDrawerProps>[][] = []

  private arcData: (DrawerDataShape<ArcDrawerProps> & {
    value: Meta
    source: ElSourceShape
    color?: string
  })[] = []

  get scale() {
    return this._scale
  }

  get data() {
    return this._data
  }

  get style() {
    return this._style
  }

  constructor(options: LayerRadialOptions, context: ChartContext) {
    super({context, options, sublayers: ['text', 'arc'], tooltipTargets: ['arc']})
  }

  setData(data: LayerRadial['data']) {
    this._data = validateAndCreateData('tableList', this.data, data, (data) => {
      return data?.select(data.headers.slice(0, 3)) ?? null
    })
  }

  setScale(scale: LayerRadialScaleShape) {
    this._scale = createScale(undefined, this.scale, scale)
    this.needRescale = false
  }

  setStyle(style: LayerRadialStyleShape) {
    this._style = createStyle(defaultStyle, this.style, style)
    this.needRescale = true
  }

  update() {
    this.needRescale && this.createScale()

    if (!this.data || !this.scale) {
      throw new Error('Invalid data or scale')
    }

    const {layout} = this.options,
      {width, height, top, left} = layout,
      {scaleAngle, scaleRadius} = this.scale,
      {cornerRadius, arc} = this.style,
      {headers, rawTableList} = this.data,
      centerX = left + width / 2,
      centerY = top + height / 2,
      colorMatrix = createColorMatrix({
        layer: this,
        row: 1,
        column: rawTableList.length,
        theme: arc?.fill,
      })

    this.arcData = rawTableList.map(([dimension, value, maxValue], i) => ({
      value,
      centerX,
      centerY,
      innerRadius: scaleRadius(dimension) ?? 0,
      outerRadius: (scaleRadius(dimension) ?? 0) + scaleRadius.bandwidth(),
      source: {value, dimension, category: headers.at(1)},
      startAngle: 0,
      endAngle: scaleAngle((value as number) / (maxValue as number)),
      cornerRadius,
      color: colorMatrix.get(0, i),
    }))
  }

  private createScale() {
    if (!this.data) return

    const {lists} = this.data,
      {layout} = this.options,
      {width, height} = layout,
      {innerRadius} = this.style,
      maxRadius = Math.min(width, height) / 2

    this._scale = createScale(
      {
        scaleAngle: scaleLinear({
          domain: [0, 1],
          range: [0, Math.PI * 2],
        }),
        scaleRadius: scaleBand({
          domain: lists.at(0) ?? [],
          range: [innerRadius ?? 0, maxRadius],
        }),
      },
      this.scale
    )
  }

  draw() {
    const arcData = this.arcData.map((group) => ({
      data: [group],
      source: [group.source],
      ...this.style.arc,
      fill: group.color,
    }))
    const textData = this.textData.map((group) => ({
      data: group.filter(({y}) => isRealNumber(y)),
      ...this.style.text,
    }))

    this.drawBasic({type: 'arc', data: arcData})
    this.drawBasic({type: 'text', data: textData})
  }
}