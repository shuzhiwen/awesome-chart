import {LayerBase} from '../base'
import {DataBase} from '../../data'
import {scaleAngle, scaleBand, scaleLinear} from '../../scales'
import {sum} from 'd3'
import {
  isRealNumber,
  isScaleAngle,
  isScaleBand,
  isScaleLinear,
  robustRange,
  safeLoop,
  scaleTypes,
  ungroup,
} from '../../utils'
import {
  createArcText,
  createScale,
  createStyle,
  createText,
  isTextCollision,
  validateAndCreateData,
} from '../helpers'
import {
  Scale,
  ChartContext,
  LayerAxisStyle,
  LayerAxisScale,
  LayerAxisOptions,
  DrawerData,
  LineDrawerProps,
  CircleDrawerProps,
  LayerStyle,
} from '../../types'

const defaultSplitLine = {
  strokeWidth: 1,
  strokeOpacity: 0.5,
  fillOpacity: 0,
  evented: false,
}

const defaultAxisLine = {
  strokeWidth: 1,
  fillOpacity: 0,
  evented: false,
}

const defaultText = {
  fontSize: 12,
  fillOpacity: 0.8,
}

const defaultTitle = {
  fontSize: 16,
  fillOpacity: 0.8,
}

const defaultOptions: Partial<LayerAxisOptions> = {
  coordinate: 'cartesian',
}

const defaultStyle: LayerAxisStyle = {
  maxScaleXTextNumber: 'auto',
  dynamicReserveTextX: false,
  splitLineAxisX: defaultSplitLine,
  splitLineAxisY: defaultSplitLine,
  splitLineAngle: defaultSplitLine,
  splitLineRadius: defaultSplitLine,
  axisLineAxisX: defaultAxisLine,
  axisLineAxisY: defaultAxisLine,
  textX: {...defaultText, offset: [0, -10]},
  textY: {...defaultText, offset: [-10, 0]},
  textYR: {...defaultText, offset: [10, 0]},
  textAngle: defaultText,
  textRadius: defaultText,
  titleX: {...defaultTitle, offset: [0, -10]},
  titleY: defaultTitle,
  titleYR: defaultTitle,
}

export class LayerAxis extends LayerBase<LayerAxisOptions> {
  private _data: Maybe<
    DataBase<{
      titleX?: string
      titleY?: string
      titleYR?: string
    }>
  >

  private _scale: LayerAxisScale = {
    nice: {
      count: 5,
      zero: false,
      paddingInner: 0.3,
    },
  }

  private _style = defaultStyle

  private lineData: Record<
    'splitLineAxisX' | 'splitLineAxisY' | 'splitLineAngle' | 'splitLineRadius',
    (Partial<DrawerData<LineDrawerProps> & DrawerData<CircleDrawerProps>> & {
      value: Meta
      angle?: number
      labelX?: number
      labelY?: number
      axisLine?: Maybe<'X' | 'Y'>
    })[]
  > = {
    splitLineAxisX: [],
    splitLineAxisY: [],
    splitLineAngle: [],
    splitLineRadius: [],
  }

  private cacheTextXData: ReturnType<typeof createText>[] = []

  private textData: Record<
    'textX' | 'textY' | 'textYR' | 'textAngle' | 'textRadius' | 'titleX' | 'titleY' | 'titleYR',
    ReturnType<typeof createText>[]
  > = {
    textX: [],
    textY: [],
    textYR: [],
    textAngle: [],
    textRadius: [],
    titleX: [],
    titleY: [],
    titleYR: [],
  }

  get scale() {
    return this._scale
  }

  get data() {
    return this._data
  }

  get style() {
    return this._style
  }

  constructor(options: LayerAxisOptions, context: ChartContext) {
    super({
      context,
      options: {...defaultOptions, ...options},
      sublayers: Object.keys(defaultStyle),
    })
  }

  setData(data: LayerAxis['data']) {
    this._data = validateAndCreateData('base', this.data, data)
  }

  setScale(scale: LayerAxisScale) {
    const {coordinate} = this.options
    this._scale = createScale(undefined, this.scale, {nice: scale?.nice})

    scaleTypes.forEach((type) => {
      if (!scale?.[type]) {
        return
      } else if (!this.scale[type] || coordinate === 'geographic') {
        this.scale[type] = scale?.[type]
        return
      } else if (isScaleLinear(this.scale[type])) {
        this.mergeScale(scale[type], type, 'domain')
      } else {
        this.scale[type] = scale?.[type]
      }

      // dangerous: latecomers first
      this.scale[type]?.range(scale[type]?.range() ?? [])
    })
  }

  private mergeScale(
    scale: Maybe<Scale>,
    type: Keys<Omit<LayerAxis['scale'], 'nice'>>,
    target: 'domain' | 'range'
  ) {
    const current = this.scale[type]?.[target]() ?? [],
      incoming = scale?.[target]() ?? []

    if (current[0] > current[1] !== incoming[0] > incoming[1]) {
      this.log.debug.warn('Layers scale does not match', {current, incoming, target})
      return
    }

    if (incoming.some((item) => !isRealNumber(item))) {
      this.log.debug.warn('Invalid layer scale', {current, incoming, target})
      return
    }

    const isReverse = current[0] > current[1]
    this.scale[type]?.[target]([
      isReverse ? Math.max(current[0], incoming[0]) : Math.min(current[0], incoming[0]),
      isReverse ? Math.min(current[1], incoming[1]) : Math.max(current[1], incoming[1]),
    ])
  }

  clearScale() {
    Object.assign(
      this._scale,
      Object.fromEntries(Array.from(scaleTypes).map((type) => [type, null]))
    )
  }

  niceScale() {
    scaleTypes.forEach((type) => {
      if (type === 'scaleColor') return

      const scale = this.scale[type]

      if (isScaleLinear(scale)) {
        this.scale[type] = scaleLinear({
          domain: scale.domain() as [number, number],
          range: scale.range() as [number, number],
          nice: this.scale.nice,
        })
      } else if (isScaleBand(scale)) {
        this.scale[type] = scaleBand({
          domain: scale.domain(),
          range: scale.range(),
          nice: this.scale.nice,
        })
      } else if (isScaleAngle(scale)) {
        this.scale[type] = scaleAngle({
          domain: [scale.domain(), scale.range().map(({weight}) => weight)],
          range: [scale.range()[0].startAngle, scale.range().slice(-1)[0].endAngle],
          nice: this.scale.nice,
        })
      }
    })
  }

  setStyle(style: LayerStyle<LayerAxisStyle>) {
    this._style = createStyle(this.options, defaultStyle, this.style, style)
  }

  update() {
    const {containerWidth, layout} = this.options,
      {left, top, width, height, bottom} = layout,
      {scaleX, scaleY, scaleYR, scaleAngle, scaleRadius} = this.scale,
      {titleX, titleY, titleYR, textX, textY, textYR, textAngle, textRadius} = this.style,
      maxRadius = scaleRadius?.range()[1] || Math.max(width / 2, height / 2),
      labelYR = this.getLabelAndPosition(scaleYR!),
      offset = 5

    this.lineData.splitLineAxisX = this.getLabelAndPosition(scaleX!, 'scaleX').map(
      ({label, position}, i) => ({
        value: label,
        x1: left + position,
        x2: left + position,
        y1: top,
        y2: top + height,
        axisLine: i === 0 ? 'X' : null,
      })
    )

    this.lineData.splitLineAxisY = this.getLabelAndPosition(scaleY! || scaleYR).map(
      ({label, position}, i) => ({
        value: label,
        x1: left,
        x2: left + width,
        y1: top + position,
        y2: top + position,
        axisLine: i === 0 ? 'Y' : null,
      })
    )

    this.lineData.splitLineAngle = this.getLabelAndPosition(scaleAngle!).map(
      ({label, position}) => ({
        value: label,
        angle: position,
        x1: left + width / 2,
        y1: top + height / 2,
        x2: left + width / 2 + Math.sin(position) * maxRadius,
        y2: top + height / 2 - Math.cos(position) * maxRadius,
        labelX: left + width / 2 + Math.sin(position) * (maxRadius + offset),
        labelY: top + height / 2 - Math.cos(position) * (maxRadius + offset),
      })
    )

    this.lineData.splitLineRadius = this.getLabelAndPosition(scaleRadius!).map(
      ({label, position}) => ({
        value: label,
        x: left + width / 2,
        y: top + height / 2,
        r: position,
      })
    )

    this.textData.titleX = [
      createText({
        x: left + width / 2,
        y: bottom - (textX?.offset?.[1] ?? 0) + (ungroup(textX?.fontSize) ?? 0),
        value: this.data?.source.titleX ?? '',
        style: titleX,
        position: 'bottom',
      }),
    ]

    this.textData.titleY = [
      createText({
        x: 0,
        y: top + height / 2,
        value: this.data?.source.titleY ?? '',
        style: titleY,
        position: 'center',
      }),
    ]

    this.textData.titleYR = [
      createText({
        x: containerWidth,
        y: top + height / 2,
        value: this.data?.source.titleYR ?? '',
        style: titleYR,
        position: 'center',
      }),
    ]

    this.textData.textX = this.lineData.splitLineAxisX.map(({value, x2, y2}) =>
      createText({x: x2!, y: y2!, value, style: textX, position: 'bottom'})
    )

    this.reduceScaleXTextNumber()
    this.textData.textX.forEach((item) => {
      if (this.cacheTextXData.every(({value}) => value !== item.value)) {
        this.cacheTextXData.push(item)
      }
    })

    if (scaleY) {
      this.textData.textY = this.lineData.splitLineAxisY.map(({value, x1, y1}) =>
        createText({x: x1!, y: y1!, value, style: textY, position: 'left'})
      )
    }
    if (scaleYR) {
      this.textData.textYR = this.lineData.splitLineAxisY.map(({x2, y2}, i) =>
        createText({x: x2!, y: y2!, value: labelYR[i]?.label, style: textYR, position: 'right'})
      )
    }

    this.textData.textRadius = this.lineData.splitLineRadius.map(({value, x, y, r}) =>
      createText({x: x!, y: y! - r!, value, style: textRadius, position: 'left', offset})
    )

    this.textData.textAngle = this.lineData.splitLineAngle.map(
      ({value, labelX, labelY, angle = 0}) =>
        createArcText({x: labelX!, y: labelY!, value, style: textAngle, angle, offset})
    )
  }

  private reduceScaleXTextNumber() {
    const {width, left, right} = this.options.layout,
      {maxScaleXTextNumber = Infinity, dynamicReserveTextX} = this.style,
      reduceHalf = (input: any[]) => input.filter((_, i) => i % 2 === 0),
      reserved = this.textData.textX.map(({x, textWidth}) => x + textWidth > left && x < right)
    let totalTextWidth = sum(this.textData.textX.map(({textWidth}) => textWidth))

    this.textData.textX = this.textData.textX.filter((_, i) => reserved[i])
    this.lineData.splitLineAxisX = this.lineData.splitLineAxisX.filter((_, i) => reserved[i])

    if (maxScaleXTextNumber === 'auto') {
      if (dynamicReserveTextX) {
        this.textData.textX = this.textData.textX.reduce<any[]>((prev, cur) => {
          if (prev.length === 0) return [cur]
          if (isTextCollision(prev[prev.length - 1], cur, 0.2)) {
            this.lineData.splitLineAxisX.splice(prev.length, 1)
            return prev
          }
          return [...prev, cur]
        }, [])
      } else {
        safeLoop(
          () => totalTextWidth > width && this.textData.textX.length > 1,
          () => {
            this.textData.textX = reduceHalf(this.textData.textX)
            totalTextWidth = sum(this.textData.textX.map(({textWidth}) => textWidth))
          }
        )
      }
    } else {
      safeLoop(
        () => this.textData.textX.length > Math.max(1, maxScaleXTextNumber),
        () => (this.textData.textX = reduceHalf(this.textData.textX))
      )
    }
  }

  private getLabelAndPosition(scale: Scale, key?: 'scaleX') {
    if (isScaleBand(scale)) {
      return scale.domain().map((label) => ({
        label,
        position:
          (scale(label) ?? 0) +
          (this.options.coordinate === 'cartesian' ? scale.bandwidth() / 2 : 0),
      }))
    } else if (isScaleLinear(scale)) {
      const [min, max] = scale.domain()
      let values = robustRange(min, max, (max - min) / (this.scale.nice?.count ?? 1))

      if (key === 'scaleX' && this.style.dynamicReserveTextX) {
        const prevValues = this.cacheTextXData
            .map(({value}) => Number(value))
            .filter((value) => isRealNumber(value)),
          maxPrevValue = Math.max(...prevValues) || -Infinity
        values = prevValues.concat(values.filter((item) => item > maxPrevValue))
      }

      return values.map((label) => ({label, position: scale(label)}))
    }

    return []
  }

  draw() {
    const {coordinate} = this.options,
      {scaleX, scaleY} = this.scale,
      getLineData = (key: Keys<LayerAxis['lineData']>) =>
        this.lineData[key].map((item) => ({
          data: [item],
          source: [{dimension: item.value}],
          ...(item.axisLine === 'X'
            ? this.style.axisLineAxisX
            : item.axisLine === 'Y'
            ? this.style.axisLineAxisY
            : this.style[key]),
        })),
      getTextData = (key: Keys<LayerAxis['textData']>, rotation?: number) =>
        this.textData[key].map((item) => ({
          data: [item],
          source: [{dimension: item.value}],
          rotation,
          ...this.style[key],
        }))

    if (coordinate === 'cartesian') {
      isScaleLinear(scaleX) &&
        this.drawBasic({
          type: 'line',
          data: getLineData('splitLineAxisX'),
          sublayer: 'splitLineAxisX',
        })
      isScaleLinear(scaleY) &&
        this.drawBasic({
          type: 'line',
          data: getLineData('splitLineAxisY'),
          sublayer: 'splitLineAxisY',
        })
      this.drawBasic({type: 'text', data: getTextData('textX'), sublayer: 'textX'})
      this.drawBasic({type: 'text', data: getTextData('textY'), sublayer: 'textY'})
      this.drawBasic({type: 'text', data: getTextData('textYR'), sublayer: 'textYR'})
      this.drawBasic({type: 'text', data: getTextData('titleX'), sublayer: 'titleX'})
      this.drawBasic({type: 'text', data: getTextData('titleY', -90), sublayer: 'titleY'})
      this.drawBasic({type: 'text', data: getTextData('titleYR', 90), sublayer: 'titleYR'})
    }

    if (coordinate === 'polar') {
      this.drawBasic({
        type: 'circle',
        data: getLineData('splitLineRadius'),
        sublayer: 'splitLineRadius',
      })
      this.drawBasic({
        type: 'line',
        data: getLineData('splitLineAngle'),
        sublayer: 'splitLineAngle',
      })
      this.drawBasic({type: 'text', data: getTextData('textAngle'), sublayer: 'textAngle'})
      this.drawBasic({type: 'text', data: getTextData('textRadius'), sublayer: 'textRadius'})
    }
  }
}
