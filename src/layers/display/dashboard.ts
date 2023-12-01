import {DataBase} from '../../data'
import {scaleLinear} from '../../scales'
import {
  ArcDrawerProps,
  DrawerData,
  LayerDashboardStyle,
  LayerOptions,
  LayerStyle,
  LineDrawerProps,
  SourceMeta,
  TextDrawerProps,
} from '../../types'
import {getAttr, isRealNumber, robustRange} from '../../utils'
import {LayerBase} from '../base'
import {
  createArcText,
  createColorMatrix,
  createData,
  createStyle,
  createText,
} from '../helpers'

type Key =
  | 'arc'
  | 'pointer'
  | 'tickLine'
  | 'tickText'
  | 'valueText'
  | 'labelText'

const defaultStyle: LayerDashboardStyle = {
  step: [2, 10],
  startAngle: -120,
  endAngle: 120,
  arcWidth: 5,
  tickSize: 10,
  tickLine: {
    strokeWidth: 2,
  },
  pointer: {
    strokeWidth: 2,
  },
  valueText: {
    offset: [0, -20],
  },
  labelText: {},
  tickText: {},
  arc: {},
}

type DataShape = {
  value: number
  fragments: {
    label: Meta
    start: number
    end: number
  }[]
}

export class LayerDashboard extends LayerBase<Key> {
  private _data: Maybe<DataBase<DataShape>>

  private _style = defaultStyle

  protected tickLineData: DrawerData<LineDrawerProps>[] = []

  protected tickTextData: DrawerData<TextDrawerProps>[] = []

  protected labelTextData: DrawerData<TextDrawerProps>[] = []

  protected valueTextData: DrawerData<TextDrawerProps>[] = []

  protected pointerData: (DrawerData<LineDrawerProps> & {
    rotation: number
  })[] = []

  protected arcData: (DrawerData<ArcDrawerProps> & {
    meta: Pick<SourceMeta, 'category' | 'value'>
    color: string
  })[] = []

  protected fragmentData: Maybe<
    DataShape & {
      minValue: number
      maxValue: number
    }
  >

  get data() {
    return this._data
  }

  get style() {
    return this._style
  }

  constructor(options: LayerOptions) {
    super({
      options,
      sublayers: [
        'arc',
        'pointer',
        'tickLine',
        'tickText',
        'valueText',
        'labelText',
      ],
      interactive: ['arc'],
    })
  }

  setData(data: LayerDashboard['data']) {
    this._data = createData('base', this.data, data)

    const {fragments} = this.data!.source

    fragments.forEach(({start, end}) => {
      if (!isRealNumber(start) || !isRealNumber(end) || start > end) {
        throw new Error('Data structure wrong')
      }
    })

    fragments.reduce((prev, cur) => {
      if (prev.end > cur.start) throw new Error('Data structure wrong')
      return cur
    })

    this.fragmentData = {
      ...this.data!.source,
      minValue: fragments[0].start ?? 0,
      maxValue: fragments[fragments.length - 1].end ?? 0,
    }
  }

  setStyle(style: LayerStyle<LayerDashboardStyle>) {
    this._style = createStyle(this.options, defaultStyle, this.style, style)
  }

  update() {
    if (!this.fragmentData) {
      throw new Error('Invalid data')
    }

    const {left, top, width, height} = this.options.layout,
      {valueText, tickText, arc, labelText} = this.style,
      {arcWidth, startAngle, endAngle, tickSize, step} = this.style,
      {value, minValue, maxValue, fragments} = this.fragmentData,
      maxRadius = Math.min(width, height) / 2,
      colorMatrix = createColorMatrix({
        layer: this,
        row: 1,
        column: fragments.length,
        theme: arc.fill,
      }),
      scaleAngle = scaleLinear({
        domain: [minValue, maxValue],
        range: [(startAngle / 180) * Math.PI, (endAngle / 180) * Math.PI],
      }),
      tickFontSize = getAttr(tickText.fontSize, 0, tickSize * 2),
      pointerLength = maxRadius - arcWidth - tickSize / 0.618 - tickFontSize,
      [centerX, centerY] = [left + width / 2, top + height / 2]

    this.arcData = fragments.map(({start, end, label}, i) => ({
      centerX,
      centerY,
      innerRadius: maxRadius - arcWidth,
      outerRadius: maxRadius,
      startAngle: scaleAngle(start),
      endAngle: scaleAngle(end),
      color: colorMatrix.get(0, i),
      meta: {category: label, value: `${start}-${end}`},
    }))

    this.pointerData = [
      {
        x1: centerX,
        y1: centerY,
        x2: centerX + pointerLength * Math.sin(scaleAngle(minValue)),
        y2: centerY - pointerLength * Math.cos(scaleAngle(minValue)),
        rotation: ((scaleAngle(value) - scaleAngle.range()[0]) / Math.PI) * 180,
      },
    ]

    this.valueTextData = [
      createText({
        value,
        position: 'center',
        style: valueText,
        x: centerX,
        y: centerY,
      }),
    ]

    this.tickTextData = []
    this.tickLineData = []
    this.labelTextData = []

    robustRange(minValue, maxValue, step[0]).map((number, i) => {
      const isBigTick = (i * step[0]) % step[1] === 0 && step[0] !== step[1],
        angle = scaleAngle(number),
        innerRadius =
          maxRadius - arcWidth - (isBigTick ? tickSize / 0.618 : tickSize),
        outerRadius = maxRadius - arcWidth - 5,
        computeX = (r: number) => centerX + Math.sin(angle) * r,
        computeY = (r: number) => centerY - Math.cos(angle) * r,
        // find the fragment if it's the center of arc
        fragment = fragments.find(({start, end}) => {
          const offsetNumber = (start + end) / 2 - number
          return offsetNumber < step[0] && offsetNumber >= 0
        })

      this.tickLineData.push({
        x1: computeX(innerRadius),
        y1: computeY(innerRadius),
        x2: computeX(outerRadius),
        y2: computeY(outerRadius),
      })

      if (isBigTick) {
        this.tickTextData.push(
          createText({
            x: computeX(innerRadius - tickSize),
            y: computeY(innerRadius - tickSize),
            value: number,
            position: 'center',
            style: tickText,
          })
        )
      }

      if (fragment) {
        this.labelTextData.push(
          createArcText({
            x: computeX(maxRadius + getAttr(labelText.fontSize, 0, 12)),
            y: computeY(maxRadius + getAttr(labelText.fontSize, 0, 12)),
            value: fragment.label,
            style: labelText,
            angle,
          })
        )
      }
    })
  }

  draw() {
    const arcData = {
      data: this.arcData,
      ...this.style.arc,
      fill: this.arcData.map(({color}) => color!),
    }
    const tickLineData = {
      data: this.tickLineData,
      ...this.style.tickLine,
    }
    const pointerData = {
      data: this.pointerData,
      rotation: this.pointerData.map(({rotation}) => rotation),
      ...this.style.pointer,
    }
    const tickTextData = {
      data: this.tickTextData,
      ...this.style.tickText,
    }
    const labelTextData = {
      data: this.labelTextData,
      ...this.style.labelText,
    }
    const valueTextData = {
      data: this.valueTextData,
      ...this.style.valueText,
    }

    this.drawBasic({type: 'arc', key: 'arc', data: [arcData]})
    this.drawBasic({type: 'line', key: 'tickLine', data: [tickLineData]})
    this.drawBasic({type: 'line', key: 'pointer', data: [pointerData]})
    this.drawBasic({type: 'text', key: 'tickText', data: [tickTextData]})
    this.drawBasic({type: 'text', key: 'labelText', data: [labelTextData]})
    this.drawBasic({type: 'text', key: 'valueText', data: [valueTextData]})
  }
}
