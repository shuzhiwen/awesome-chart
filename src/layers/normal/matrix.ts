import {scaleLinear, scaleQuantize} from 'd3'
import {DataTable} from '../../data'
import {scaleBand} from '../../scales'
import {
  CircleDrawerProps,
  DrawerData,
  LayerMatrixScale,
  LayerMatrixStyle,
  LayerOptions,
  LayerStyle,
  LegendData,
  RectDrawerProps,
  SourceMeta,
  TextDrawerProps,
} from '../../types'
import {getMagnitude, noChange} from '../../utils'
import {LayerBase} from '../base'
import {
  createColorMatrix,
  createScale,
  createStyle,
  createText,
  validateAndCreateData,
} from '../helpers'

type Key = 'rect' | 'circle' | 'text'

const defaultStyle: LayerMatrixStyle = {
  shape: 'rect',
  circleSize: ['auto', 'auto'],
  colorDomain: 'auto',
}

export class LayerMatrix extends LayerBase<Key> {
  public legendData: Maybe<LegendData>

  private _data: Maybe<DataTable>

  private _scale: LayerMatrixScale

  private _style = defaultStyle

  private rectData: (DrawerData<RectDrawerProps> & {
    value: Meta
    meta: Pick<SourceMeta, 'dimension' | 'value'>
    color: string
  })[][] = []

  private circleData: (DrawerData<CircleDrawerProps> & {
    value: Meta
    meta: Pick<SourceMeta, 'dimension' | 'value'>
    color: string
  })[][] = []

  private textData: DrawerData<TextDrawerProps>[][] = []

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
      sublayers: ['rect', 'circle', 'text'],
      interactive: ['rect', 'circle'],
    })
  }

  setData(data: LayerMatrix['data']) {
    this._data = validateAndCreateData('table', this.data, data)
    this.createScale()
  }

  setScale(scale: LayerMatrixScale) {
    this._scale = createScale(undefined, this.scale, scale)
  }

  setStyle(style: LayerStyle<LayerMatrixStyle>) {
    this._style = createStyle(this.options, defaultStyle, this.style, style)
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
    if (!this.data || !this.scale) {
      throw new Error('Invalid data or scale')
    }

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
        column: Math.ceil(distance / getMagnitude(distance / body.flatMap(noChange).length)),
        theme: shape === 'rect' ? rect?.fill : circle?.fill,
      }),
      scaleColor =
        this.scale.scaleColor ||
        scaleQuantize<string>()
          .domain(colorDomain === 'auto' ? [minValue, maxValue] : colorDomain!)
          .range(colorMatrix.matrix[0])

    if (!this.scale.scaleColor) {
      this._scale = createScale({...this.scale, scaleColor}, this.scale)
    }

    if (shape === 'rect') {
      this.rectData = body.map((values, i) =>
        values.map((value, j) => ({
          value,
          meta: {dimension: `${rows[i]} ${columns[j]}`, value},
          x: left + (scaleX(columns[j]) ?? 0),
          y: top + (scaleY(rows[i]) ?? 0),
          width: bandwidthX,
          height: bandwidthY,
          color: scaleColor(Number(value)),
        }))
      )
    }

    if (shape === 'circle') {
      this.circleData = body.map((values, i) =>
        values.map((value, j) => ({
          value,
          meta: {dimension: `${rows[i]} ${columns[j]}`, value},
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
      ...this.style.rect,
      fill: group.map(({color}) => color),
    }))
    const circleData = this.circleData.map((group) => ({
      data: group,
      ...this.style.circle,
      fill: group.map(({color}) => color),
    }))
    const textData = this.textData.map((group) => ({
      data: group,
      ...this.style.text,
    }))

    this.style.shape === 'rect' &&
      this.drawBasic({
        type: 'rect',
        key: 'rect',
        data: rectData,
      })
    this.style.shape === 'circle' &&
      this.drawBasic({
        type: 'circle',
        key: 'circle',
        data: circleData,
      })
    this.drawBasic({
      type: 'text',
      key: 'text',
      data: textData,
    })
  }
}
