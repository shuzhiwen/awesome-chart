import {LayerBase} from './base'
import {createArcText, createScale, createStyle, createText, validateAndCreateData} from './helpers'
import {
  Scale,
  ChartContext,
  LayerAxisStyleShape,
  LayerLineOptions,
  LayerAxisScaleShape,
} from '../types'
import {DataBase} from '../data'
import {isScaleBand, isScaleLinear, range, SCALE_TYPES, ungroup} from '../utils'
import {scaleLinear} from '../scales'

const defaultTickLine = {
  stroke: 'white',
  strokeWidth: 1,
  strokeOpacity: 0.2,
  fillOpacity: 0,
}

const defaultAxisLine = {
  stroke: 'white',
  strokeWidth: 1,
  strokeOpacity: 0.5,
}

const defaultText = {
  fontSize: 12,
  fillOpacity: 0.8,
}

const defaultTitle = {
  fontSize: 12,
  fillOpacity: 0.8,
}

const defaultStyle: LayerAxisStyleShape = {
  lineAxisX: defaultAxisLine,
  lineAxisY: defaultAxisLine,
  lineAngle: defaultTickLine,
  lineRadius: defaultTickLine,
  textX: defaultText,
  textY: defaultText,
  textYR: defaultText,
  textAngle: defaultText,
  textRadius: defaultText,
  titleX: defaultTitle,
  titleY: defaultTitle,
  titleYR: defaultTitle,
}

const lineKey = ['lineAxisX', 'lineAxisY', 'lineAngle', 'lineRadius'] as const
const labelKey = ['textX', 'textY', 'textYR', 'textAngle', 'textRadius'] as const
const titleKey = ['titleX', 'titleY', 'titleYR'] as const

export class LayerAxis extends LayerBase<LayerLineOptions> {
  private _data: Maybe<
    DataBase<{
      titleX: string
      titleY: string
      titleYR: string
    }>
  >

  private _scale: LayerAxisScaleShape = {
    nice: {
      count: 5,
      zero: false,
      paddingInner: 0,
    },
  }

  private _style = defaultStyle

  private lineData: Record<
    'lineAxisX' | 'lineAxisY' | 'lineAngle' | 'lineRadius',
    {
      value: Meta
      x1?: number
      x2?: number
      y1?: number
      y2?: number
      cx?: number
      cy?: number
      angle?: number
      r?: number
    }[]
  > = {lineAxisX: [], lineAxisY: [], lineAngle: [], lineRadius: []}

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
    return this._scale!
  }

  get data() {
    return this._data!
  }

  get style() {
    return this._style!
  }

  constructor(options: LayerLineOptions, context: ChartContext) {
    super({
      options,
      context,
      tooltipTargets: ['interactive'],
      sublayers: ['interactive', ...lineKey, ...labelKey, ...titleKey],
    })
  }

  setData(data: LayerAxis['data']) {
    this._data = validateAndCreateData('base', this.data, data)
  }

  setScale(scale: LayerAxisScaleShape) {
    const {coordinate} = this.options
    this._scale = createScale(undefined, this.scale, {nice: scale?.nice})

    SCALE_TYPES.forEach((type) => {
      if (!scale?.[type]) {
        return
      } else if (!this.scale[type] || coordinate === 'geographic') {
        this.scale[type] = scale?.[type]
      } else if (isScaleLinear(this.scale[type])) {
        const current = this.scale[type]?.domain()!,
          incoming = scale[type]?.domain()!

        if (current[0] > current[1] !== incoming[0] > incoming[1]) {
          this.log.warn('Layers scale does not match', {current, incoming})
        } else {
          const isReverse = current[0] > current[1]
          this.scale[type]?.domain([
            isReverse ? Math.max(current[0], incoming[0]) : Math.min(current[0], incoming[0]),
            isReverse ? Math.min(current[1], incoming[1]) : Math.max(current[1], incoming[1]),
          ])
        }

        scaleLinear({
          domain: this.scale[type]?.domain() as [number, number],
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
    const {containerWidth, layout} = this.options,
      {left, top, width, height, bottom} = layout,
      {titleX, titleY, titleYR, textX, textY, textYR, textAngle, textRadius} = this.style,
      maxRadius = this.scale.scaleRadius?.range()[1] || Math.max(width / 2, height / 2)

    this.lineData.lineAxisX = this.getLabelAndPosition(this.scale.scaleX!).map(
      ({label, position}) => ({
        value: label,
        x1: left + position,
        x2: left + position,
        y1: top,
        y2: top + height,
      })
    )

    this.lineData.lineAxisY = this.getLabelAndPosition(this.scale.scaleY!).map(
      ({label, position}) => ({
        value: label,
        x1: left,
        x2: left + width,
        y1: top + position,
        y2: top + position,
      })
    )

    this.lineData.lineAngle = this.getLabelAndPosition(this.scale.scaleAngle!).map(
      ({label, position}) => ({
        value: label,
        angle: position,
        x1: left + width / 2,
        y1: top + height / 2,
        x2: left + width / 2 + Math.sin((position / 180) * Math.PI) * maxRadius,
        y2: top + height / 2 - Math.cos((position / 180) * Math.PI) * maxRadius,
      })
    )

    this.lineData.lineRadius = this.getLabelAndPosition(this.scale.scaleRadius!).map(
      ({label, position}) => ({
        value: label,
        cx: left + width / 2,
        cy: top + height / 2,
        r: position,
      })
    )

    this.textData.titleX = [
      createText({
        x: left + width / 2,
        y: bottom - (textX.offset?.[1] ?? 0) + (ungroup(textX.fontSize) ?? 0),
        value: this.data.source.titleX,
        style: titleX,
        position: 'bottom',
      }),
    ]

    this.textData.titleY = [
      createText({
        x: (ungroup(titleY.fontSize) ?? 0) / 2,
        y: top + height / 2,
        value: this.data.source.titleY,
        style: titleY,
        position: 'center',
      }),
    ]

    this.textData.titleYR = [
      createText({
        x: containerWidth - (ungroup(titleY.fontSize) ?? 0) / 2,
        y: top + height / 2,
        value: this.data.source.titleYR,
        style: titleYR,
        position: 'center',
      }),
    ]

    this.textData.textX = this.lineData.lineAxisX.map(({value, x2, y2}) =>
      createText({x: x2!, y: y2!, value, style: textX, position: 'bottom'})
    )

    this.textData.textY = this.lineData.lineAxisY.map(({value, x1, y1}) =>
      createText({x: x1!, y: y1!, value, style: textY, position: 'left'})
    )

    this.textData.textYR = this.lineData.lineAxisY.map(({value, x2, y2}) =>
      createText({x: x2!, y: y2!, value, style: textYR, position: 'right'})
    )

    this.textData.textRadius = this.lineData.lineRadius.map(({value, cx, cy, r}) =>
      createText({x: cx!, y: cy! - r!, value, style: textRadius, position: 'right'})
    )

    this.textData.textAngle = this.lineData.lineAngle.map(({value, x2, y2, angle = 0}) =>
      createArcText({x: x2!, y: y2!, value, style: textAngle, angle})
    )
  }

  private getLabelAndPosition(scale: Scale) {
    if (isScaleBand(scale)) {
      return scale
        .domain()
        .map((label) => ({label, position: (scale(label) ?? 0) + scale.bandwidth() / 2}))
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
      getLineData = (key: Keys<LayerAxis['lineData']>) => [
        {
          data: this.lineData[key].map(({x1, y1, x2, y2}) => [x1, y1, x2, y2]),
          ...this.style[key],
        },
      ],
      getRadiusData = (key: Keys<LayerAxis['lineData']>) => [
        {
          data: this.lineData[key].map(({r}) => [r, r]),
          position: this.lineData[key].map(({cx, cy}) => [cx, cy]),
          ...this.style[key],
        },
      ],
      getTextData = (key: Keys<LayerAxis['textData']>, rotation?: number) => [
        {
          data: this.textData[key].map(({value}) => value),
          position: this.textData[key].map(({x, y}) => [x, y]),
          transformOrigin: this.textData[key].map(({transformOrigin}) => transformOrigin),
          rotation,
          ...this.style[key],
        },
      ]

    if (coordinate === 'cartesian') {
      isScaleLinear(scaleX) &&
        this.drawBasic({type: 'line', data: getLineData('lineAxisX'), sublayer: 'lineAxisX'})
      isScaleLinear(scaleY) &&
        this.drawBasic({type: 'line', data: getLineData('lineAxisY'), sublayer: 'lineAxisY'})
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
        data: getRadiusData('lineRadius'),
        sublayer: 'lineRadius',
      })
      this.drawBasic({type: 'line', data: getLineData('lineAngle'), sublayer: 'lineAngle'})
      this.drawBasic({type: 'text', data: getTextData('textAngle'), sublayer: 'textAngle'})
      this.drawBasic({type: 'text', data: getTextData('textRadius'), sublayer: 'textRadius'})
    }
  }
}
