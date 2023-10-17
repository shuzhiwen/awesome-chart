import {sum} from 'd3'
import {scaleTypes} from '../../core'
import {DataBase} from '../../data'
import {scaleAngle, scaleBand, scaleLinear} from '../../scales'
import {
  CircleDrawerProps,
  DrawerData,
  LayerAxisScale,
  LayerAxisStyle,
  LayerOptions,
  LayerStyle,
  LineDrawerProps,
  Scale,
} from '../../types'
import {
  isRealNumber,
  isScaleAngle,
  isScaleBand,
  isScaleLinear,
  robustRange,
  safeLoop,
  ungroup,
} from '../../utils'
import {LayerBase} from '../base'
import {
  createArcText,
  createData,
  createScale,
  createStyle,
  createText,
  isTextCollision,
} from '../helpers'

type Key = Keys<typeof defaultStyle>

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
  hidden: true,
}

const defaultText = {
  fontSize: 12,
  fillOpacity: 0.8,
}

const defaultTitle = {
  fontSize: 16,
  fillOpacity: 0.8,
}

const defaultStyle: LayerAxisStyle = {
  coordinate: 'cartesian',
  maxScaleXTextNumber: 'auto',
  dynamicReserveTextX: false,
  axisLineX: defaultAxisLine,
  axisLineY: defaultAxisLine,
  splitLineX: defaultSplitLine,
  splitLineY: defaultSplitLine,
  splitLineAngle: defaultSplitLine,
  splitLineRadius: defaultSplitLine,
  textX: {...defaultText, offset: [0, -10]},
  textY: {...defaultText, offset: [-10, 0]},
  textYR: {...defaultText, offset: [10, 0]},
  textAngle: defaultText,
  textRadius: defaultText,
  titleX: {...defaultTitle, offset: [0, -10]},
  titleY: {...defaultTitle, offset: [10, 0]},
  titleYR: defaultTitle,
}

export class LayerAxis extends LayerBase<Key> {
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
    'axisLineX' | 'axisLineY' | 'splitLineX' | 'splitLineY' | 'splitLineAngle',
    (DrawerData<LineDrawerProps> &
      Partial<{
        value: Meta
        angle: number
        labelX: number
        labelY: number
      }>)[]
  > = {
    axisLineX: [],
    axisLineY: [],
    splitLineX: [],
    splitLineY: [],
    splitLineAngle: [],
  }

  private splitLineRadiusData: (DrawerData<CircleDrawerProps> & {
    value: Meta
  })[] = []

  private disabledAxisX: Set<ReturnType<typeof createText>> = new Set()

  private textData: Record<
    | 'textX'
    | 'textY'
    | 'textYR'
    | 'textAngle'
    | 'textRadius'
    | 'titleX'
    | 'titleY'
    | 'titleYR',
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

  constructor(options: LayerOptions) {
    super({options, sublayers: Object.keys(defaultStyle) as Key[]})
  }

  setData(data: LayerAxis['data']) {
    this._data = createData('base', this.data, data)
  }

  setScale(scale: LayerAxisScale) {
    const {coordinate} = this.style
    this._scale = createScale(undefined, this.scale, {nice: scale.nice})

    scaleTypes.forEach((type) => {
      if (!scale[type]) {
        return
      } else if (!this.scale[type] || coordinate === 'geographic') {
        this.scale[type] = scale[type]
        return
      } else if (isScaleLinear(this.scale[type])) {
        this.mergeScale(scale[type], type, 'domain')
      } else {
        this.scale[type] = scale[type]
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
    const current = this.scale[type]?.[target]() ?? []
    const incoming = scale?.[target]() ?? []

    if (current[0] > current[1] !== incoming[0] > incoming[1]) {
      this.log.debug.warn('Layers scale does not match', {
        current,
        incoming,
        target,
      })
      return
    }

    if (incoming.some((item) => !isRealNumber(item))) {
      this.log.debug.warn('Invalid layer scale', {current, incoming, target})
      return
    }

    const isReverse = current[0] > current[1]
    this.scale[type]?.[target]([
      isReverse
        ? Math.max(current[0], incoming[0])
        : Math.min(current[0], incoming[0]),
      isReverse
        ? Math.min(current[1], incoming[1])
        : Math.max(current[1], incoming[1]),
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
          domain: scale.domain() as Vec2,
          range: scale.range() as Vec2,
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
          range: [
            scale.range()[0].startAngle,
            scale.range().slice(-1)[0].endAngle,
          ],
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
      {left, top, width, height, bottom, right} = layout,
      {scaleX, scaleY, scaleYR, scaleAngle, scaleRadius} = this.scale,
      {titleX, titleY, titleYR, textX, textY, textYR, textAngle, textRadius} =
        this.style,
      maxRadius = scaleRadius?.range()[1] || Math.max(width / 2, height / 2),
      labelYR = this.getLabelAndPosition(scaleYR!),
      offset = 5

    this.lineData.axisLineX = [{x1: left, x2: right, y1: bottom, y2: bottom}]
    this.lineData.axisLineY = [{x1: left, x2: left, y1: top, y2: bottom}]

    this.lineData.splitLineX = this.getLabelAndPosition(scaleX!).map(
      ({label, position}) => ({
        value: label,
        x1: left + position,
        x2: left + position,
        y1: top,
        y2: top + height,
      })
    )

    this.lineData.splitLineY = this.getLabelAndPosition(scaleY! || scaleYR).map(
      ({label, position}) => ({
        value: label,
        x1: left,
        x2: left + width,
        y1: top + position,
        y2: top + position,
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

    this.splitLineRadiusData = this.getLabelAndPosition(scaleRadius!).map(
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
        y: bottom - (textX.offset?.[1] ?? 0) + (ungroup(textX.fontSize) ?? 0),
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

    this.textData.textX = this.lineData.splitLineX.map(({value, x2, y2}) =>
      createText({x: x2!, y: y2!, value, style: textX, position: 'bottom'})
    )

    this.reduceScaleXTextNumber()

    if (scaleY) {
      this.textData.textY = this.lineData.splitLineY.map(({value, x1, y1}) =>
        createText({x: x1!, y: y1!, value, style: textY, position: 'left'})
      )
    }
    if (scaleYR) {
      this.textData.textYR = this.lineData.splitLineY.map(({x2, y2}, i) =>
        createText({
          x: x2!,
          y: y2!,
          value: labelYR[i].label,
          style: textYR,
          position: 'right',
        })
      )
    }

    this.textData.textRadius = this.splitLineRadiusData.map(
      ({value, x, y, r}) =>
        createText({
          x: x!,
          y: y! - r!,
          value,
          style: textRadius,
          position: 'left',
          offset,
        })
    )

    this.textData.textAngle = this.lineData.splitLineAngle.map(
      ({value, labelX, labelY, angle = 0}) =>
        createArcText({
          x: labelX!,
          y: labelY!,
          value,
          style: textAngle,
          angle,
          offset,
        })
    )
  }

  private reduceScaleXTextNumber() {
    const {width, left, right} = this.options.layout,
      {maxScaleXTextNumber, dynamicReserveTextX} = this.style,
      getEnabledTextX = () =>
        this.textData.textX.filter((item) => !this.disabledAxisX.has(item)),
      getTextXTotalWidth = () =>
        sum(getEnabledTextX().map(({textWidth}) => textWidth)),
      markHalfTextXDisabled = () => {
        getEnabledTextX().forEach(
          (item, i) => i % 2 !== 0 && this.disabledAxisX.add(item)
        )
      }

    this.disabledAxisX.clear()
    this.textData.textX.forEach((item) => {
      if (item.x + item.textWidth < left && item.x > right) {
        this.disabledAxisX.add(item)
      }
    })

    if (maxScaleXTextNumber === 'auto') {
      if (dynamicReserveTextX) {
        this.textData.textX.reduce((prev, cur) => {
          if (isTextCollision(prev, cur, 0.2)) {
            this.disabledAxisX.add(cur)
            return prev
          }
          return cur
        })
      } else {
        safeLoop(
          () => getTextXTotalWidth() > width && this.textData.textX.length > 1,
          () => markHalfTextXDisabled()
        )
      }
    } else {
      safeLoop(
        () => getEnabledTextX().length > Math.max(1, maxScaleXTextNumber),
        () => markHalfTextXDisabled()
      )
    }
  }

  private getLabelAndPosition(scale: Scale) {
    if (isScaleBand(scale)) {
      return scale.domain().map((label) => ({
        label,
        position:
          (scale(label) ?? 0) +
          (this.style.coordinate === 'cartesian' ? scale.bandwidth() / 2 : 0),
      }))
    } else if (isScaleLinear(scale)) {
      const [min, max] = scale.domain(),
        {fixedStep, count} = this.scale.nice ?? {},
        step = fixedStep || (max - min) / (count ?? 1)

      return count === 0
        ? []
        : robustRange(min, max, step).map((label) => ({
            label,
            position: scale(label),
          }))
    }

    return []
  }

  draw() {
    const {coordinate} = this.style,
      {scaleX, scaleY} = this.scale,
      disabledAxisXIndex = Array.from(this.disabledAxisX).map((item) =>
        this.textData.textX.findIndex((item2) => item2 === item)
      ),
      getLineData = (key: Keys<LayerAxis['lineData']>) =>
        this.lineData[key].map((item, i) => ({
          data: [item],
          opacity:
            key === 'splitLineX' && disabledAxisXIndex.includes(i) ? 0 : 1,
          ...this.style[key],
        })),
      getTextData = (key: Keys<LayerAxis['textData']>, rotation?: number) =>
        this.textData[key].map((item, i) => ({
          data: [{...item, meta: {dimension: item.value}}],
          opacity: key === 'textX' && disabledAxisXIndex.includes(i) ? 0 : 1,
          rotation,
          ...this.style[key],
        }))

    if (coordinate === 'cartesian') {
      this.drawBasic({
        type: 'line',
        key: 'axisLineX',
        data: getLineData('axisLineX'),
      })
      this.drawBasic({
        type: 'line',
        key: 'axisLineY',
        data: getLineData('axisLineY'),
      })
      isScaleLinear(scaleX) &&
        this.drawBasic({
          type: 'line',
          key: 'splitLineX',
          data: getLineData('splitLineX'),
        })
      isScaleLinear(scaleY) &&
        this.drawBasic({
          type: 'line',
          key: 'splitLineY',
          data: getLineData('splitLineY'),
        })
      this.drawBasic({type: 'text', key: 'textX', data: getTextData('textX')})
      this.drawBasic({type: 'text', key: 'textY', data: getTextData('textY')})
      this.drawBasic({type: 'text', key: 'textYR', data: getTextData('textYR')})
      this.drawBasic({type: 'text', key: 'titleX', data: getTextData('titleX')})
      this.drawBasic({
        type: 'text',
        key: 'titleY',
        data: getTextData('titleY', -90),
      })
      this.drawBasic({
        type: 'text',
        key: 'titleYR',
        data: getTextData('titleYR', 90),
      })
    }

    if (coordinate === 'polar') {
      this.drawBasic({
        type: 'circle',
        key: 'splitLineRadius',
        data: this.splitLineRadiusData.map((item) => ({
          data: [item],
          ...this.style.splitLineRadius,
        })),
      })
      this.drawBasic({
        type: 'line',
        key: 'splitLineAngle',
        data: getLineData('splitLineAngle'),
      })
      this.drawBasic({
        type: 'text',
        key: 'textAngle',
        data: getTextData('textAngle'),
      })
      this.drawBasic({
        type: 'text',
        key: 'textRadius',
        data: getTextData('textRadius'),
      })
    }
  }
}
