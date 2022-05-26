import {LayerBase} from '../base'
import {DataTableList} from '../../data'
import {isCanvasContainer, isScaleLinear} from '../../utils'
import {
  createColorMatrix,
  createScale,
  createStyle,
  createText,
  validateAndCreateData,
} from '../helpers'
import {
  ChartContext,
  LayerAuxiliaryStyleShape,
  DrawerDataShape,
  TextDrawerProps,
  LegendDataShape,
  LayerAuxiliaryScaleShape,
  LayerAuxiliaryOptions,
  LineDrawerProps,
} from '../../types'

const defaultOptions: Partial<LayerAuxiliaryOptions> = {
  direction: 'horizontal',
}

const defaultStyle: LayerAuxiliaryStyleShape = {
  enableLegend: true,
  labelPosition: 'right',
  labelOffset: 5,
  line: {
    strokeDasharray: '5 5',
  },
}

export class LayerAuxiliary extends LayerBase<LayerAuxiliaryOptions> {
  public legendData: Maybe<LegendDataShape>

  private _data: Maybe<DataTableList>

  private _scale: LayerAuxiliaryScaleShape

  private _style = defaultStyle

  private textData: DrawerDataShape<TextDrawerProps>[] = []

  private lineData: (DrawerDataShape<LineDrawerProps> & {
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
    super({
      context,
      options: {...defaultOptions, ...options},
      sublayers: ['text', 'line'],
    })

    if (isCanvasContainer(this.root)) {
      this.root.evented = false
    }
  }

  setData(data: LayerAuxiliary['data']) {
    this._data = validateAndCreateData('base', this.data, data)
  }

  setScale(scale: LayerAuxiliaryScaleShape) {
    this._scale = createScale(undefined, this.scale, scale)
  }

  setStyle(style: LayerAuxiliaryStyleShape) {
    this._style = createStyle(defaultStyle, this.style, style)
  }

  update() {
    if (!this.data || !this.scale) {
      throw new Error('Invalid data or scale')
    }

    const {direction, layout} = this.options,
      {left, top, width, height} = layout,
      {scaleX, scaleY} = this.scale,
      {labelPosition, labelOffset, line, text, enableLegend} = this.style,
      {rawTableList} = this.data,
      colorMatrix = createColorMatrix({
        layer: this,
        row: rawTableList.length,
        column: 1,
        theme: line?.stroke,
      })

    if (direction === 'horizontal' && isScaleLinear(scaleY)) {
      this.lineData = rawTableList.map(([, value], i) => ({
        value,
        x1: left,
        y1: top + (scaleY(value as number) ?? 0),
        x2: left + width,
        y2: top + (scaleY(value as number) ?? 0),
        color: colorMatrix.get(i, 0),
      }))
    } else if (direction === 'vertical' && isScaleLinear(scaleX)) {
      this.lineData = rawTableList.map(([, value], i) => ({
        value,
        x1: left + (scaleX(value as number) ?? 0),
        y1: top,
        x2: left + (scaleX(value as number) ?? 0),
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

    if (enableLegend) {
      this.legendData = {
        colorMatrix,
        filter: 'row',
        legends: rawTableList.map(([label], i) => ({
          label,
          shape: 'dotted-line',
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

    this.drawBasic({type: 'line', data: [lineData]})
    this.drawBasic({type: 'text', data: [textData]})
  }
}
