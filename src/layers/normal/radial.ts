import {DataTableList} from '../../data'
import {scaleBand, scaleLinear} from '../../scales'
import {
  ArcDrawerProps,
  DrawerData,
  LayerOptions,
  LayerRadialScale,
  LayerRadialStyle,
  LayerStyle,
  LegendData,
  SourceMeta,
  TextDrawerProps,
} from '../../types'
import {isRealNumber} from '../../utils'
import {LayerBase} from '../base'
import {
  createColorMatrix,
  createData,
  createScale,
  createStyle,
} from '../helpers'

type Key = 'text' | 'arc'

const defaultStyle: LayerRadialStyle = {
  innerRadius: 10,
  cornerRadius: Infinity,
  text: {},
  arc: {},
}

export class LayerRadial extends LayerBase<Key> {
  public legendData: Maybe<LegendData>

  private _data: Maybe<DataTableList>

  private _scale: LayerRadialScale

  private _style = defaultStyle

  protected textData: DrawerData<TextDrawerProps>[][] = []

  protected arcData: (DrawerData<ArcDrawerProps> & {
    value: Meta
    meta: SourceMeta
    color: string
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

  constructor(options: LayerOptions) {
    super({options, sublayers: ['text', 'arc'], interactive: ['arc']})
  }

  setData(data: LayerRadial['data']) {
    this._data = createData('tableList', this.data, data, (data) => {
      return data?.select(data.headers.slice(0, 3))
    })
    this.createScale()
  }

  setScale(scale: LayerRadialScale) {
    this._scale = createScale(undefined, this.scale, scale)
  }

  setStyle(style: LayerStyle<LayerRadialStyle>) {
    this._style = createStyle(this.options, defaultStyle, this.style, style)
    this.createScale()
  }

  update() {
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
        theme: arc.fill,
      })

    this.arcData = rawTableList.map(([dimension, value, maxValue], i) => ({
      value,
      centerX,
      centerY,
      innerRadius: scaleRadius(dimension) ?? 0,
      outerRadius: (scaleRadius(dimension) ?? 0) + scaleRadius.bandwidth(),
      meta: {dimension, category: headers[1], value},
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
          domain: lists[0],
          range: [innerRadius ?? 0, maxRadius],
        }),
      },
      this.scale
    )
  }

  draw() {
    const arcData = this.arcData.map((group) => ({
      data: [group],
      ...this.style.arc,
      fill: group.color,
    }))
    const textData = this.textData.map((group) => ({
      data: group.filter(({y}) => isRealNumber(y)),
      ...this.style.text,
    }))

    this.drawBasic({type: 'arc', key: 'arc', data: arcData})
    this.drawBasic({type: 'text', key: 'text', data: textData})
  }
}
