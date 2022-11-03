import {LayerBase} from '../base'
import {DataTableList} from '../../data'
import {getAttr, isCC, isScaleBand, isScaleLinear} from '../../utils'
import {
  createColorMatrix,
  createScale,
  createStyle,
  createText,
  validateAndCreateData,
} from '../helpers'
import {
  ChartContext,
  LayerAuxiliaryStyle,
  DrawerData,
  TextDrawerProps,
  LegendData,
  LayerAuxiliaryScale,
  LayerAuxiliaryOptions,
  LineDrawerProps,
  RectDrawerProps,
} from '../../types'

const defaultStyle: LayerAuxiliaryStyle = {
  direction: 'horizontal',
  enableLegend: true,
  labelPosition: 'right',
  labelOffset: 5,
  line: {
    strokeDasharray: '5 5',
  },
  labelBackground: {
    hidden: true,
  },
}

export class LayerAuxiliary extends LayerBase<LayerAuxiliaryOptions> {
  public legendData: Maybe<LegendData>

  private _data: Maybe<DataTableList>

  private _scale: LayerAuxiliaryScale

  private _style = defaultStyle

  private textData: (DrawerData<TextDrawerProps> & {
    textWidth: number
  })[] = []

  private backgroundData: DrawerData<RectDrawerProps>[] = []

  private lineData: (DrawerData<LineDrawerProps> & {
    value: Meta
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

  constructor(options: LayerAuxiliaryOptions, context: ChartContext) {
    super({context, options, sublayers: ['text', 'line', 'background']})

    if (isCC(this.root)) {
      this.root.evented = false
    }
  }

  setData(data: LayerAuxiliary['data']) {
    this._data = validateAndCreateData('tableList', this.data, data)
  }

  setScale(scale: LayerAuxiliaryScale) {
    this._scale = createScale(undefined, this.scale, scale)
  }

  setStyle(style: LayerAuxiliaryStyle) {
    this._style = createStyle(defaultStyle, this.style, style)
  }

  update() {
    if (!this.data || !this.scale) {
      throw new Error('Invalid data or scale')
    }

    const {rawTableList} = this.data,
      {scaleX, scaleY} = this.scale,
      {left, top, width, height} = this.options.layout,
      {labelPosition, direction, labelOffset, line, text, enableLegend} = this.style,
      offsetX = isScaleBand(scaleX) ? scaleX.bandwidth() / 2 : 0,
      offsetY = isScaleBand(scaleY) ? scaleY.bandwidth() / 2 : 0,
      colorMatrix = createColorMatrix({
        layer: this,
        row: rawTableList.length,
        column: 1,
        theme: line?.stroke,
      })

    if (direction === 'horizontal' && (isScaleLinear(scaleY) || isScaleBand(scaleY))) {
      this.lineData = rawTableList.map(([, value], i) => ({
        value,
        x1: left,
        y1: top + (scaleY(value as number) ?? 0) + offsetY,
        x2: left + width,
        y2: top + (scaleY(value as number) ?? 0) + offsetY,
        color: colorMatrix.get(i, 0),
      }))
    } else if (direction === 'vertical' && (isScaleLinear(scaleX) || isScaleBand(scaleX))) {
      this.lineData = rawTableList.map(([, value], i) => ({
        value,
        x1: left + (scaleX(value as number) ?? 0) + offsetX,
        y1: top,
        x2: left + (scaleX(value as number) ?? 0) + offsetX,
        y2: top + height,
        color: colorMatrix.get(i, 0),
      }))
    }

    this.textData = this.lineData.map(({value, x1, y1, x2, y2}) =>
      createText({
        value,
        x: labelPosition === 'left' ? x1 : labelPosition === 'right' ? x2 : (x1 + x2) / 2,
        y: labelPosition === 'top' ? y1 : labelPosition === 'bottom' ? y2 : (y1 + y2) / 2,
        position: labelPosition,
        offset: labelOffset,
        style: text,
      })
    )

    this.backgroundData = this.textData.map(({x, y, textWidth}) => ({
      x: x - 4,
      y: y - getAttr(text?.fontSize, 0, 12) - 4,
      width: textWidth + 8,
      height: getAttr(text?.fontSize, 0, 12) + 8,
    }))

    if (enableLegend) {
      this.legendData = {
        colorMatrix,
        filter: 'row',
        legends: rawTableList.map(([label], i) => ({
          label,
          shape: 'dottedLine',
          color: colorMatrix.get(i, 0),
        })),
      }
    }
  }

  draw() {
    const textData = {
      data: this.textData,
      ...this.style.text,
    }
    const lineData = {
      data: this.lineData,
      ...this.style.line,
      stroke: this.lineData.map(({color}) => color),
    }
    const backgroundData = {
      data: this.backgroundData,
      ...this.style.labelBackground,
    }

    this.drawBasic({type: 'rect', data: [backgroundData], sublayer: 'background'})
    this.drawBasic({type: 'line', data: [lineData]})
    this.drawBasic({type: 'text', data: [textData]})
  }
}
