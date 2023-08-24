import {DataTableList} from '../../data'
import {scaleBand, scaleLinear} from '../../scales'
import {
  CircleDrawerProps,
  DrawerData,
  LayerOptions,
  LayerRadarScale,
  LayerRadarStyle,
  LayerStyle,
  LegendData,
  PolyDrawerProps,
  SourceMeta,
  TextDrawerProps,
} from '../../types'
import {errorCatcher} from '../../utils'
import {LayerBase} from '../base'
import {
  createArcText,
  createColorMatrix,
  createData,
  createScale,
  createStyle,
} from '../helpers'

type Key = 'text' | 'polygon' | 'point'

const defaultStyle: LayerRadarStyle = {
  mode: 'cover',
  pointSize: 6,
  polygon: {
    strokeWidth: 2,
    fillOpacity: 0.4,
  },
}

export class LayerRadar extends LayerBase<Key> {
  public legendData: Maybe<LegendData>

  private _data: Maybe<DataTableList>

  private _scale: LayerRadarScale

  private _style = defaultStyle

  private textData: DrawerData<TextDrawerProps>[][] = []

  private pointData: (DrawerData<CircleDrawerProps> & {
    angle: number
    meta: SourceMeta
    color: string
  })[][] = []

  private polygonData: (DrawerData<PolyDrawerProps> & {
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
    super({
      options,
      sublayers: ['text', 'polygon', 'point'],
      interactive: ['point'],
    })
    this.createScale = errorCatcher(this.createScale.bind(this), () => {
      this.log.warn('Create scale failed')
    })
  }

  setData(data: LayerRadar['data']) {
    this._data = createData('tableList', this.data, data)
    this.createScale()
  }

  setScale(scale: LayerRadarScale) {
    this._scale = createScale(undefined, this.scale, scale)
  }

  setStyle(style: LayerStyle<LayerRadarStyle>) {
    this._style = createStyle(this.options, defaultStyle, this.style, style)
    this.createScale()
  }

  private createScale() {
    if (!this.data) return

    const {layout} = this.options,
      {lists, headers} = this.data,
      {mode} = this.style

    this._scale = createScale(
      {
        scaleAngle: scaleBand({
          domain: lists[0],
          range: [0, Math.PI * 2],
        }),
        scaleRadius: scaleLinear({
          domain:
            mode === 'stack'
              ? [
                  0,
                  this.data
                    .select(headers.slice(1), {mode: 'sum', target: 'row'})
                    .range()[1],
                ]
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

    const {layout} = this.options,
      {headers, rawTableList} = this.data,
      {width, height, left, top} = layout,
      {scaleAngle, scaleRadius} = this.scale,
      {pointSize, polygon, mode} = this.style,
      [centerX, centerY] = [left + width / 2, top + height / 2],
      colorMatrix = createColorMatrix({
        layer: this,
        row: 1,
        column: headers.length - 1,
        theme: polygon?.fill,
      })

    this.pointData = rawTableList.map(([dimension, ...values]) =>
      values.map((value, i) => {
        const angle = scaleAngle(dimension) ?? 0
        const centerR = scaleRadius(Number(value))

        return {
          angle,
          r: pointSize / 2,
          x: centerX + Math.sin(angle) * centerR,
          y: centerY - Math.cos(angle) * centerR,
          color: colorMatrix.get(0, i),
          meta: {value, dimension, category: headers[i + 1]},
        }
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
      color: this.pointData[0]?.[i]?.color ?? 'white',
      centerX,
      centerY,
    }))

    this.textData = this.pointData.map((group) =>
      group.map(({meta, x, y, angle}) =>
        createArcText({x, y, value: meta.value, angle})
      )
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

  draw() {
    const polygonData = this.polygonData.map((group) => ({
      data: [group],
      ...this.style.polygon,
      fill: [group.color],
      stroke: [group.color],
    }))
    const pointData = this.pointData.map((group) => ({
      data: group,
      ...this.style.point,
      fill: group.map((item) => item.color),
    }))
    const textData = this.textData.map((group) => ({
      data: group,
      ...this.style.text,
    }))

    this.drawBasic({type: 'polygon', key: 'polygon', data: polygonData})
    this.drawBasic({type: 'circle', key: 'point', data: pointData})
    this.drawBasic({type: 'text', key: 'text', data: textData})
  }
}
