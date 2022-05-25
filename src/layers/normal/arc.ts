import {LayerBase} from '../base'
import {isRealNumber} from '../../utils'
import {scaleAngle, scaleLinear} from '../../scales'
import {DataTableList} from '../../data'
import {
  createArcText,
  createColorMatrix,
  createScale,
  createStyle,
  createText,
  validateAndCreateData,
} from '../helpers'
import {
  ChartContext,
  LayerArcStyleShape,
  DrawerDataShape,
  TextDrawerProps,
  LayerArcOptions,
  LegendDataShape,
  LayerArcScaleShape,
  ArcDrawerProps,
  ElSourceShape,
} from '../../types'

const defaultOptions: Partial<LayerArcOptions> = {
  variant: 'pie',
}

const defaultStyle: LayerArcStyleShape = {
  innerRadius: 0,
  labelOffset: 5,
  labelPosition: 'inner',
}

export class LayerArc extends LayerBase<LayerArcOptions> {
  public legendData: Maybe<LegendDataShape>

  private needRescale = false

  private _data: Maybe<DataTableList>

  private _scale: LayerArcScaleShape

  private _style = defaultStyle

  private textData: DrawerDataShape<TextDrawerProps>[][] = []

  private arcData: (DrawerDataShape<ArcDrawerProps> & {
    value: Meta
    source: ElSourceShape
    color?: string
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

  constructor(options: LayerArcOptions, context: ChartContext) {
    super({
      context,
      options: {...defaultOptions, ...options},
      sublayers: ['arc', 'text'],
      tooltipTargets: ['arc'],
    })
  }

  setData(data: LayerArc['data']) {
    const {variant} = this.options

    this.needRescale = true
    this._data = validateAndCreateData('tableList', this.data, data, (data) => {
      if (variant === 'pie') {
        return data?.select(data.headers.slice(0, 2)) ?? null
      }
      return data
    })
  }

  setScale(scale: LayerArcScaleShape) {
    this._scale = createScale(undefined, this.scale, scale)
    this.needRescale = false
  }

  setStyle(style: LayerArcStyleShape) {
    this._style = createStyle(defaultStyle, this.style, style)
    this.needRescale = true
  }

  update() {
    this.needRescale && this.createScale()

    if (!this.data || this.data.lists.length <= 1 || !this.scale) {
      this.arcData = []
      this.textData = []
      return
    }

    const {layout, variant} = this.options,
      {width, height, top, left} = layout,
      {scaleAngle, scaleRadius} = this.scale,
      {innerRadius = 0, arc} = this.style,
      {headers, rawTableList} = this.data,
      centerX = left + width / 2,
      centerY = top + height / 2

    this.arcData = rawTableList.map(([dimension, ...values]) =>
      values.map((value, i) => ({
        value,
        centerX,
        centerY,
        innerRadius,
        outerRadius: scaleRadius(value as number),
        source: {value, dimension, category: headers[i + 1]},
        ...scaleAngle(dimension as string),
      }))
    )

    if (variant === 'nightingaleRose') {
      this.arcData.forEach((group) =>
        group.forEach((item, i) => {
          if (i !== 0) {
            item.innerRadius = group[i - 1].outerRadius
            item.outerRadius = item.innerRadius + item.outerRadius - innerRadius
          }
        })
      )
    }

    if (this.arcData[0]?.length > 1) {
      const colorMatrix = createColorMatrix({
        layer: this,
        row: 1,
        column: this.arcData[0].length,
        theme: arc?.fill,
      })
      this.arcData.forEach((group) =>
        group.forEach((item, i) => (item.color = colorMatrix.get(0, i)))
      )
      this.legendData = {
        colorMatrix,
        filter: 'column',
        legends: this.data.headers.slice(1).map((header, i) => ({
          shape: 'rect',
          label: header,
          color: colorMatrix.get(0, i),
        })),
      }
    } else if (this.arcData[0]?.length === 1) {
      const colorMatrix = createColorMatrix({
        layer: this,
        row: this.arcData.length,
        column: 1,
        theme: arc?.fill,
      })
      this.arcData.forEach((group, i) => (group[0].color = colorMatrix.get(i, 0)))
      this.legendData = {
        colorMatrix,
        filter: 'row',
        legends: rawTableList.map((item, i) => ({
          shape: 'rect',
          label: item[0],
          color: colorMatrix.get(i, 0),
        })),
      }
    }

    this.textData = this.arcData.map((group) => group.map((data) => this.createArcLabel(data)))
  }

  private createArcLabel = (props: ArrayItem<ArrayItem<LayerArc['arcData']>>) => {
    const {text, labelPosition, labelOffset = 0} = this.style,
      {value, centerX, centerY, innerRadius, outerRadius, startAngle, endAngle} = props,
      angle = (startAngle + endAngle) / 2

    if (labelPosition === 'inner') {
      const r = (innerRadius + outerRadius) / 2,
        x = centerX + Math.sin(angle) * r,
        y = centerY - Math.cos(angle) * r

      return createText({x, y, value, style: text, position: 'center'})
    } else {
      const r = outerRadius + labelOffset,
        x = centerX + Math.sin(angle) * r,
        y = centerY - Math.cos(angle) * r

      return createArcText({x, y, value, style: text, angle})
    }
  }

  private createScale() {
    if (!this.data) return

    this.needRescale = false

    const {layout, variant} = this.options,
      {width, height} = layout,
      {headers} = this.data,
      {innerRadius} = this.style,
      labels = this.data.select(headers[0]),
      maxRadius = Math.min(width, height) / 2

    if (variant === 'pie') {
      const percentages = this.data.select(headers[1], {mode: 'percentage', target: 'column'})
      this._scale = createScale(
        {
          scaleAngle: scaleAngle({
            domain: labels.concat(percentages),
            range: [0, Math.PI * 2],
          }),
          scaleRadius: scaleLinear({
            domain: [-Number.MIN_VALUE, Number.MAX_VALUE],
            range: [maxRadius, maxRadius],
          }),
        },
        this.scale
      )
    }

    if (variant === 'nightingaleRose') {
      const percentages = this.data.select(headers[1]),
        tableList = new DataTableList([
          percentages.headers,
          ...percentages.lists[0].map(() => [1 / percentages.lists[0].length]),
        ])

      this._scale = createScale(
        {
          scaleAngle: scaleAngle({
            domain: labels.concat(tableList),
            range: [0, Math.PI * 2],
          }),
          scaleRadius: scaleLinear({
            domain: [
              0,
              this.data.select(headers.slice(1), {mode: 'sum', target: 'row'}).range()[1],
            ],
            range: [innerRadius ?? 0, maxRadius],
          }),
        },
        this.scale
      )
    }
  }

  draw() {
    const arcData = this.arcData.map((group) => ({
      data: group,
      source: group.map((item) => item.source),
      ...this.style.arc,
      fill: group.map(({color}) => color!),
    }))
    const textData = this.textData.map((group) => ({
      data: group.filter(({y}) => isRealNumber(y)),
      ...this.style.text,
    }))

    this.drawBasic({type: 'arc', data: arcData})
    this.drawBasic({type: 'text', data: textData})
  }
}
