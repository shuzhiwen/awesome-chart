import {LayerBase} from '../base'
import {scaleBand, scaleLinear} from '../../scales'
import {DataTableList} from '../../data'
import {
  createArcText,
  createColorMatrix,
  createScale,
  createStyle,
  validateAndCreateData,
} from '../helpers'
import {
  ChartContext,
  LayerRadarStyleShape,
  DrawerDataShape,
  TextDrawerProps,
  LayerRadarOptions,
  LegendDataShape,
  LayerRadarScaleShape,
  CircleDrawerProps,
  PolyDrawerProps,
  ElSourceShape,
} from '../../types'

const defaultOptions: Partial<LayerRadarOptions> = {
  mode: 'cover',
}

const defaultStyle: LayerRadarStyleShape = {
  pointSize: 6,
  point: {},
  polygon: {
    strokeWidth: 2,
    fillOpacity: 0.4,
  },
}

export class LayerRadar extends LayerBase<LayerRadarOptions> {
  public legendData: Maybe<LegendDataShape>

  private _data: Maybe<DataTableList>

  private _scale: LayerRadarScaleShape

  private _style = defaultStyle

  private textData: DrawerDataShape<TextDrawerProps>[][] = []

  private pointData: (DrawerDataShape<CircleDrawerProps> & {
    angle: number
    source: ElSourceShape
    color: string
  })[][] = []

  private polygonData: (DrawerDataShape<PolyDrawerProps> & {
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

  constructor(options: LayerRadarOptions, context: ChartContext) {
    super({
      context,
      options: {...defaultOptions, ...options},
      sublayers: ['text', 'polygon', 'point'],
      tooltipTargets: ['point'],
    })
  }

  setData(data: LayerRadar['data']) {
    this._data = validateAndCreateData('tableList', this.data, data)
    this.createScale()
  }

  setScale(scale: LayerRadarScaleShape) {
    this._scale = createScale(undefined, this.scale, scale)
  }

  setStyle(style: LayerRadarStyleShape) {
    this._style = createStyle(defaultStyle, this.style, style)
  }

  private createScale() {
    if (!this.data) return

    const {mode, layout} = this.options,
      {lists, headers} = this.data

    this._scale = createScale(
      {
        scaleAngle: scaleBand({
          domain: lists.at(0) ?? [],
          range: [0, Math.PI * 2],
        }),
        scaleRadius: scaleLinear({
          domain:
            mode === 'stack'
              ? [0, this.data.select(headers.slice(1), {mode: 'sum', target: 'row'}).range()[1]]
              : [0, this.data.select(headers.slice(1)).range()[1]],
          range: [0, Math.min(layout.width, layout.height) / 2],
        }),
      },
      this.scale
    )
  }

  update() {
    if (!this.data || !this.scale) {
      throw new Error('Invalid data or scale')
    }

    const {mode, layout} = this.options,
      {headers, rawTableList} = this.data,
      {width, height, left, top} = layout,
      {scaleAngle, scaleRadius} = this.scale,
      {pointSize = 6, polygon} = this.style,
      [centerX, centerY] = [left + width / 2, top + height / 2],
      colorMatrix = createColorMatrix({
        layer: this,
        row: 1,
        column: headers.length - 1,
        theme: polygon?.fill,
      })

    this.pointData = rawTableList.map(([dimension, ...values]) =>
      values.map((value, i) => {
        const angle = scaleAngle(dimension) ?? 0,
          centerR = scaleRadius(Number(value)),
          x = centerX + Math.sin(angle) * centerR,
          y = centerY - Math.cos(angle) * centerR,
          source = {value, dimension, category: headers[i + 1]}
        return {x, y, angle, r: pointSize / 2, color: colorMatrix.get(0, i), source}
      })
    )

    if (mode === 'stack') {
      this.pointData.forEach((group) => {
        group.forEach((item, i) => {
          if (i !== 0) {
            item.x = group[i - 1].x + item.x - centerX
            item.y = group[i - 1].y + item.y - centerY
          }
        })
      })
    }

    this.polygonData = this.pointData[0].map((_, i) => ({
      points: this.pointData.map((group) => ({x: group[i].x, y: group[i].y})),
      color: this.pointData.at(0)?.at(i)?.color ?? 'white',
      centerX,
      centerY,
    }))

    this.textData = this.pointData.map((group) =>
      group.map(({source, x, y, angle}) => createArcText({x, y, value: source.value, angle}))
    )

    this.legendData = {
      colorMatrix,
      filter: 'column',
      legends: headers.slice(1).map((header, i) => ({
        label: header,
        shape: 'broken-line',
        color: colorMatrix.get(0, i),
      })),
    }
  }

  draw() {
    const polygonData = this.polygonData.map((group) => ({
      data: [group],
      ...this.style.polygon,
      fill: [group.color],
      stroke: [group.color],
    }))
    const pointData = this.pointData.map((group) => ({
      data: group,
      source: group.map(({source}) => source),
      ...this.style.point,
      fill: group.map((item) => item.color),
    }))
    const textData = this.textData.map((group) => ({
      data: group,
      ...this.style.text,
    }))

    this.drawBasic({type: 'polygon', data: polygonData})
    this.drawBasic({type: 'circle', data: pointData, sublayer: 'point'})
    this.drawBasic({type: 'text', data: textData})
  }
}
