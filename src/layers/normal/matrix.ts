import {LayerBase} from '../base'
import {DataTable} from '../../data'
import {scaleBand} from '../../scales'
import {scaleLinear, scaleQuantize} from 'd3'
import {getMagnitude, noChange} from '../../utils'
import {
  createColorMatrix,
  createScale,
  createStyle,
  createText,
  validateAndCreateData,
} from '../helpers'
import {
  ChartContext,
  CircleDrawerProps,
  DrawerDataShape,
  ElSourceShape,
  LayerMatrixOptions,
  LayerMatrixScaleShape,
  LayerMatrixStyleShape,
  LegendDataShape,
  RectDrawerProps,
  TextDrawerProps,
} from '../../types'

const defaultStyle: LayerMatrixStyleShape = {
  shape: 'rect',
  circleSize: ['auto', 'auto'],
  colorDomain: 'auto',
}

export class LayerMatrix extends LayerBase<LayerMatrixOptions> {
  public legendData: Maybe<LegendDataShape>

  private _data: Maybe<DataTable>

  private _scale: LayerMatrixScaleShape

  private _style = defaultStyle

  private rectData: (DrawerDataShape<RectDrawerProps> & {
    value: Meta
    source: ElSourceShape
    color: string
  })[][] = []

  private circleData: (DrawerDataShape<CircleDrawerProps> & {
    value: Meta
    source: ElSourceShape
    color: string
  })[][] = []

  private textData: DrawerDataShape<TextDrawerProps>[][] = []

  get scale() {
    return this._scale
  }

  get data() {
    return this._data
  }

  get style() {
    return this._style
  }

  constructor(options: LayerMatrixOptions, context: ChartContext) {
    super({
      context,
      options,
      sublayers: ['rect', 'circle', 'text'],
      tooltipTargets: ['rect', 'circle'],
    })
  }

  setData(data: LayerMatrix['data']) {
    this._data = validateAndCreateData('table', this.data, data)
    this.createScale()
  }

  setScale(scale: LayerMatrixScaleShape) {
    this._scale = createScale(undefined, this.scale, scale)
  }

  setStyle(style: LayerMatrixStyleShape) {
    this._style = createStyle(defaultStyle, this.style, style)
  }

  private createScale() {
    if (!this.data) return

    const {layout} = this.options,
      {width, height} = layout,
      {rows, columns} = this.data

    this._scale = createScale(
      {
        scaleX: scaleBand({
          domain: columns,
          range: [0, width],
        }),
        scaleY: scaleBand({
          domain: rows,
          range: [height, 0],
        }),
      },
      this.scale
    )
  }

  update() {
    if (!this.data || !this.scale) return

    const {layout} = this.options,
      {left, top} = layout,
      {rows, columns, body} = this.data,
      {scaleX, scaleY} = this.scale,
      {shape, circleSize, rect, circle, text, colorDomain} = this.style,
      [bandwidthX, bandwidthY] = [scaleX.bandwidth(), scaleY.bandwidth()],
      [minValue, maxValue] = this.data.range(),
      distance = maxValue - minValue,
      colorMatrix = createColorMatrix({
        layer: this,
        row: 1,
        column: Math.ceil(distance / getMagnitude(distance, body.flatMap(noChange).length)),
        theme: shape === 'rect' ? rect?.fill : circle?.fill,
      }),
      scaleColor = scaleQuantize<string>()
        .domain(colorDomain === 'auto' ? [minValue, maxValue] : colorDomain!)
        .range(colorMatrix.matrix[0])

    if (shape === 'rect') {
      this.rectData = body.map((values, i) =>
        values.map((value, j) => ({
          value,
          source: {dimension: `${rows[i]} ${columns[j]}`, value},
          x: left + (scaleX(columns[j]) ?? 0),
          y: top + (scaleY(rows[i]) ?? 0),
          width: bandwidthX,
          height: bandwidthY,
          color: scaleColor(Number(value) - minValue),
        }))
      )
    }

    if (shape === 'circle') {
      this.circleData = body.map((values, i) =>
        values.map((value, j) => ({
          value,
          source: {dimension: `${rows[i]} ${columns[j]}`, value},
          x: left + (scaleX(columns[j]) ?? 0) + bandwidthX / 2,
          y: top + (scaleY(rows[i]) ?? 0) + bandwidthY / 2,
          r: Math.min(bandwidthX, bandwidthY) / 2,
          color: scaleColor(Number(value) - minValue),
        }))
      )
    }

    this.textData = body.map((values, i) =>
      values.map((value, j) =>
        createText({
          x: left + (scaleX(columns[j]) ?? 0) + bandwidthX / 2,
          y: top + (scaleY(rows[i]) ?? 0) + bandwidthY / 2,
          value,
          style: text,
          position: 'center',
        })
      )
    )

    if (shape === 'circle') {
      const ceiling = Math.min(scaleX.bandwidth(), scaleY.bandwidth()) / 1.8
      let [min, max] = circleSize!

      if (max === 'auto' || max < 0) max = ceiling
      if (min === 'auto' || min < 0) min = max > ceiling ? ceiling / 2 : max / 2

      const scale = scaleLinear().domain(this.data.range()).range([min, max])

      this.circleData.forEach((group) =>
        group.forEach((item) => (item.r = scale(Number(item.value))))
      )
    }
  }

  draw() {
    const rectData = this.rectData.map((group) => ({
      data: group,
      source: group.map(({source}) => source),
      transformOrigin: 'center',
      ...this.style.rect,
      fill: group.map(({color}) => color),
    }))
    const circleData = this.circleData.map((group) => ({
      data: group,
      source: group.map(({source}) => source),
      ...this.style.circle,
      fill: group.map(({color}) => color),
    }))
    const textData = this.textData.map((group) => ({
      data: group,
      ...this.style.text,
    }))

    this.style.shape === 'rect' && this.drawBasic({type: 'rect', data: rectData})
    this.style.shape === 'circle' && this.drawBasic({type: 'circle', data: circleData})
    this.drawBasic({type: 'text', data: textData})
  }
}
