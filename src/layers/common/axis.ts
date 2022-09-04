import {LayerBase} from '../base'
import {DataBase} from '../../data'
import {isScaleBand, isScaleLinear, range, scaleTypes, ungroup} from '../../utils'
import {scaleBand, scaleLinear} from '../../scales'
import {sum} from 'd3'
import {
  createArcText,
  createScale,
  createStyle,
  createText,
  validateAndCreateData,
} from '../helpers'
import {
  Scale,
  ChartContext,
  LayerAxisStyleShape,
  LayerAxisScaleShape,
  LayerAxisOptions,
  DrawerDataShape,
  LineDrawerProps,
  CircleDrawerProps,
} from '../../types'

const defaultSplitLine = {
  stroke: 'white',
  strokeWidth: 1,
  strokeOpacity: 0.5,
  fillOpacity: 0,
  evented: false,
}

const defaultAxisLine = {
  stroke: 'white',
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

const defaultStyle: LayerAxisStyleShape = {
  maxScaleXTextNumber: Infinity,
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

  private _scale: LayerAxisScaleShape = {
    nice: {
      count: 5,
      zero: false,
      paddingInner: 0.3,
    },
  }

  private _style = defaultStyle

  private lineData: Record<
    'splitLineAxisX' | 'splitLineAxisY' | 'splitLineAngle' | 'splitLineRadius',
    (Partial<DrawerDataShape<LineDrawerProps> & DrawerDataShape<CircleDrawerProps>> & {
      value: Meta
      angle?: number
      labelX?: number
      labelY?: number
      axisLine?: Maybe<'X' | 'Y' | 'YR'>
    })[]
  > = {
    splitLineAxisX: [],
    splitLineAxisY: [],
    splitLineAngle: [],
    splitLineRadius: [],
  }

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

  setScale(scale: LayerAxisScaleShape) {
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
    type: keyof Omit<LayerAxis['scale'], 'nice'>,
    target: 'domain' | 'range'
  ) {
    const current = this.scale[type]?.[target]() ?? [],
      incoming = scale?.[target]() ?? []

    if (current[0] > current[1] !== incoming[0] > incoming[1]) {
      this.log.debug.warn('Layers scale does not match', {current, incoming, target})
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

      if (isScaleLinear(this.scale[type])) {
        this.scale[type] = scaleLinear({
          domain: this.scale[type]?.domain() as [number, number],
          range: this.scale[type]?.range() as [number, number],
          nice: this.scale.nice,
        })
      } else if (isScaleBand(this.scale[type])) {
        this.scale[type] = scaleBand({
          domain: this.scale[type]?.domain() as string[],
          range: this.scale[type]?.range() as [number, number],
          nice: this.scale.nice,
        })
      }
    })
  }

  setStyle(style: LayerAxisStyleShape) {
    this._style = createStyle(defaultStyle, this.style, style)
  }

  update() {
    const {scaleY, scaleYR} = this.scale,
      {containerWidth, layout} = this.options,
      {left, top, width, height, bottom} = layout,
      {titleX, titleY, titleYR, textX, textY, textYR, textAngle, textRadius} = this.style,
      maxRadius = this.scale.scaleRadius?.range()[1] || Math.max(width / 2, height / 2),
      labelYR = this.getLabelAndPosition(this.scale.scaleYR!),
      offset = 5

    this.lineData.splitLineAxisX = this.getLabelAndPosition(this.scale.scaleX!).map(
      ({label, position}, i) => ({
        value: label,
        x1: left + position,
        x2: left + position,
        y1: top,
        y2: top + height,
        axisLine: i === 0 ? 'X' : null,
      })
    )

    this.lineData.splitLineAxisY = this.getLabelAndPosition(
      this.scale.scaleY! || this.scale.scaleYR
    ).map(({label, position}, i, array) => ({
      value: label,
      x1: left,
      x2: left + width,
      y1: top + position,
      y2: top + position,
      axisLine: i === 0 ? 'Y' : i === array.length - 1 && scaleYR ? 'YR' : null,
    }))

    this.lineData.splitLineAngle = this.getLabelAndPosition(this.scale.scaleAngle!).map(
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

    this.lineData.splitLineRadius = this.getLabelAndPosition(this.scale.scaleRadius!).map(
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
      {maxScaleXTextNumber = Infinity} = this.style
    let totalTextWidth = sum(this.textData.textX.map(({textWidth}) => textWidth))

    this.textData.textX = this.textData.textX.filter(
      ({x, textWidth}) => x + textWidth > left && x < right
    )

    if (maxScaleXTextNumber === 'auto') {
      while (totalTextWidth > width && this.textData.textX.length > 1) {
        this.textData.textX = this.textData.textX.filter((_, i) => i % 2 === 0)
        totalTextWidth = sum(this.textData.textX.map(({textWidth}) => textWidth))
      }
    } else {
      while (this.textData.textX.length > maxScaleXTextNumber) {
        this.textData.textX = this.textData.textX.filter((_, i) => i % 2 === 0)
      }
    }
  }

  private getLabelAndPosition(scale: Scale) {
    if (isScaleBand(scale)) {
      return scale.domain().map((label) => ({
        label,
        position:
          (scale(label) ?? 0) +
          (this.options.coordinate === 'cartesian' ? scale.bandwidth() / 2 : 0),
      }))
    } else if (isScaleLinear(scale)) {
      const [min, max] = scale.domain()

      return range(min, max, (max - min) / (this.scale.nice?.count ?? 1)).map((label) => ({
        label,
        position: scale(label),
      }))
    }

    return []
  }

  draw() {
    const {coordinate} = this.options,
      {scaleX, scaleY} = this.scale,
      getLineData = (key: keyof LayerAxis['lineData']) =>
        this.lineData[key].map((item) => ({
          data: [item],
          ...(item.axisLine === 'X'
            ? this.style.axisLineAxisX
            : item.axisLine === 'Y' || item.axisLine === 'YR'
            ? this.style.axisLineAxisY
            : this.style[key]),
        })),
      getTextData = (key: keyof LayerAxis['textData'], rotation?: number) =>
        this.textData[key].map((item) => ({
          data: [item],
          source: [{dimension: item.value}],
          transformOrigin: item.transformOrigin,
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
