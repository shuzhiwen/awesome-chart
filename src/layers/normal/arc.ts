import {DataTableList} from '../../data'
import {scaleAngle, scaleLinear} from '../../scales'
import {
  ArcDrawerProps,
  ChartContext,
  CurveDrawerProps,
  DrawerData,
  LayerArcOptions,
  LayerArcScale,
  LayerArcStyle,
  LayerStyle,
  LegendData,
  SourceMeta,
  TextDrawerProps,
} from '../../types'
import {errorCatcher, isRealNumber} from '../../utils'
import {LayerBase} from '../base'
import {
  createColorMatrix,
  createScale,
  createStyle,
  createText,
  validateAndCreateData,
} from '../helpers'

const defaultOptions: Partial<LayerArcOptions> = {
  variant: 'pie',
}

const defaultStyle: LayerArcStyle = {
  innerRadius: 0,
  labelOffset: 5,
  labelPosition: 'inner',
  guideLine: {
    fillOpacity: 0,
    strokeWidth: 1,
  },
}

export class LayerArc extends LayerBase<LayerArcOptions> {
  public legendData: Maybe<LegendData>

  private needRescale = false

  private _data: Maybe<DataTableList>

  private _scale: LayerArcScale

  private _style = defaultStyle

  private textData: DrawerData<TextDrawerProps>[][] = []

  private guideLineData: DrawerData<CurveDrawerProps>['points'][][] = []

  private arcData: (DrawerData<ArcDrawerProps> & {
    value: Meta
    meta: SourceMeta
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
      sublayers: ['arc', 'guideLine', 'text'],
      interactive: ['arc'],
    })
    this.createScale = errorCatcher(this.createScale.bind(this), () => {
      this.log.warn('Create scale failed')
    })
  }

  setData(data: LayerArc['data']) {
    const {variant} = this.options

    this.needRescale = true
    this._data = validateAndCreateData('tableList', this.data, data, (data) => {
      if (variant === 'pie') {
        return data?.select(data.headers.slice(0, 2)) ?? null
      }
    })
  }

  setScale(scale: LayerArcScale) {
    this._scale = createScale(undefined, this.scale, scale)
    this.needRescale = false
  }

  setStyle(style: LayerStyle<LayerArcStyle>) {
    this._style = createStyle(this.options, defaultStyle, this.style, style)
    this.needRescale = true
  }

  update() {
    this.needRescale && this.createScale()

    if (!this.data || !this.scale) {
      throw new Error('Invalid data or scale')
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
        meta: {dimension, category: headers[i + 1], value},
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
        legends: headers.slice(1).map((header, i) => ({
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

    const labelLine = this.arcData.map((group) =>
      group.map((data) => this.createArcLabelAndGuideLine(data))
    )

    this.textData = labelLine.map((group) => group.map(({text}) => text))
    this.guideLineData = labelLine.map((group) => group.map(({points}) => points))
  }

  private createArcLabelAndGuideLine = (props: NonNullable<Ungroup<LayerArc['arcData']>>) => {
    const {text: style, labelPosition, labelOffset = 0} = this.style,
      {value, centerX, centerY, innerRadius, outerRadius, startAngle, endAngle} = props,
      getX = (r: number) => centerX + Math.sin(angle) * r,
      getY = (r: number) => centerY - Math.cos(angle) * r,
      angle = (startAngle + endAngle) / 2

    if (labelPosition === 'inner') {
      const r = (innerRadius + outerRadius) / 2

      return {
        points: [],
        text: createText({x: getX(r), y: getY(r), value, style, position: 'center'}),
      }
    } else {
      const [x1, y1] = [getX(outerRadius), getY(outerRadius)],
        [x2, y2] = [getX(outerRadius + labelOffset), getY(outerRadius + labelOffset)],
        factor = -Math.sin(angle) + (angle > Math.PI ? -Math.SQRT2 : Math.SQRT2)

      return {
        text: createText({
          x: x2 + (labelOffset + 2) * factor,
          y: y2,
          value,
          style,
          position: angle > Math.PI ? 'left' : 'right',
        }),
        points: [
          {x: x1, y: y1},
          {x: x2, y: y2},
          {x: x2 + labelOffset * factor, y: y2},
        ],
      }
    }
  }

  private createScale() {
    if (!this.data) return

    this.needRescale = false

    const {layout, variant} = this.options,
      {width, height} = layout,
      {headers} = this.data,
      {innerRadius} = this.style,
      labels = this.data.lists[0],
      maxRadius = Math.min(width, height) / 2

    if (variant === 'pie') {
      const percentages = this.data.select(headers[1], {mode: 'percentage', target: 'column'})
      this._scale = createScale(
        {
          scaleAngle: scaleAngle({
            domain: [labels, percentages.lists[0]],
            range: [0, Math.PI * 2],
          }),
          scaleRadius: scaleLinear({
            domain: this.data.select(headers[1]).range(),
            range: [maxRadius, maxRadius],
          }),
        },
        this.scale
      )
    }

    if (variant === 'nightingaleRose') {
      this._scale = createScale(
        {
          scaleAngle: scaleAngle({
            domain: [labels, labels.map(() => 1 / labels.length)],
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
      ...this.style.arc,
      fill: group.map(({color}) => color!),
    }))
    const guideLineData = this.guideLineData.map((group) => ({
      data: group.map((points) => ({points, curve: 'curveLinear' as Curve})),
      ...this.style.guideLine,
    }))
    const textData = this.textData.map((group) => ({
      data: group.filter(({y}) => isRealNumber(y)),
      ...this.style.text,
    }))

    this.drawBasic({type: 'arc', data: arcData})
    this.drawBasic({type: 'curve', data: guideLineData, sublayer: 'guideLine'})
    this.drawBasic({type: 'text', data: textData})

    this.event.onWithOff('click-arc', 'internal', ({data}) => {
      if (this.options.variant === 'nightingaleRose') return

      const {groupIndex, itemIndex} = data.source,
        {width, height, left, top} = this.options.layout,
        [centerX, centerY] = [left + width / 2, top + height / 2],
        target = this.arcData[groupIndex][itemIndex],
        angle = (target.startAngle + target.endAngle) / 2,
        move = target.centerX === centerX && target.centerY === centerY

      this.arcData.forEach((group) =>
        group.forEach((item) => ((item.centerX = centerX), (item.centerY = centerY)))
      )

      if (move) {
        target.centerX += (Math.sin(angle) * target.outerRadius) / 10
        target.centerY -= (Math.cos(angle) * target.outerRadius) / 10
      }

      const labelLine = this.arcData.map((group) =>
        group.map((data) => this.createArcLabelAndGuideLine(data))
      )

      this.textData = labelLine.map((group) => group.map(({text}) => text))
      this.guideLineData = labelLine.map((group) => group.map(({points}) => points))
      this.draw()
    })
  }
}
