import {fabric} from 'fabric'
import {LayerBase} from '../base'
import {createColorMatrix, createStyle, createText, validateAndCreateData} from '../helpers'
import {createSinusoidal, isSvgCntr} from '../../utils'
import {DataBase} from '../../data'
import {range} from 'd3'
import {
  AreaDrawerProps,
  ChartContext,
  CircleDrawerProps,
  DrawerDataShape,
  LayerWaveOptions,
  LayerWaveStyleShape,
  TextDrawerProps,
} from '../../types'

const defaultStyle: LayerWaveStyleShape = {
  amplitudeFactor: 0.1,
  areaNumber: 2,
  areaGap: 100,
  area: {
    fillOpacity: 0.5,
  },
  background: {
    stroke: 'gray',
    strokeWidth: 8,
    fillOpacity: 0,
  },
  text: {
    fontSize: 30,
    fontWeight: 700,
  },
}

export class LayerWave extends LayerBase<LayerWaveOptions> {
  private _style = defaultStyle

  private _data: Maybe<
    DataBase<{
      value: number
      maxValue: number
    }>
  >

  private areaData: Required<
    DrawerDataShape<AreaDrawerProps> & {
      value: Meta
      color: string
    }
  >[] = []

  private backgroundData: DrawerDataShape<CircleDrawerProps>[] = []

  private textData: DrawerDataShape<TextDrawerProps>[] = []

  get data() {
    return this._data
  }

  get style() {
    return this._style
  }

  constructor(options: LayerWaveOptions, context: ChartContext) {
    super({options, context, sublayers: ['area', 'background', 'text']})

    const {id, layout} = this.options,
      {width, height, left, top} = layout,
      radius = Math.min(width, height) / 2

    if (isSvgCntr(this.root)) {
      this.root
        .append('defs')
        .append('clipPath')
        .attr('id', `clipPath-${id}`)
        .append('circle')
        .attr('cx', left + width / 2)
        .attr('cy', top + height / 2)
        .attr('r', radius)
      this.root.attr('clip-path', `url(#clipPath-${this.options.id})`)
    } else {
      this.root.clipPath = new fabric.Circle({
        absolutePositioned: true,
        left: left + width / 2 - radius,
        top: top + height / 2 - radius,
        radius,
      })
    }
  }

  setData(data: LayerWave['data']) {
    this._data = validateAndCreateData('base', this.data, data)
  }

  setScale() {}

  setStyle(style: LayerWaveStyleShape) {
    this._style = createStyle(defaultStyle, this._style, style)
  }

  update() {
    if (!this.data) {
      throw new Error('Invalid data or scale')
    }

    const {value, maxValue} = this.data.source,
      {areaNumber = 1, amplitudeFactor = 1, areaGap = 0, area} = this.style,
      {left, width, height, top, bottom} = this.options.layout,
      waveHeight = height * amplitudeFactor,
      colorMatrix = createColorMatrix({
        layer: this,
        row: 1,
        column: areaNumber,
        theme: area?.fill,
      })

    this.areaData = range(0, areaNumber, 1).map((index) => ({
      curve: 'curveMonotoneX',
      color: colorMatrix.get(0, index),
      value: value / maxValue,
      lines: createSinusoidal(
        left - areaGap * index,
        top - waveHeight / 2 + (1 - value / maxValue) * height,
        width,
        waveHeight,
        10
      ).map(([x, y]) => ({
        x,
        y1: y,
        y2: bottom,
      })),
    }))

    this.backgroundData = [
      {
        x: left + width / 2,
        y: top + height / 2,
        r: Math.min(width, height) / 2,
      },
    ]

    this.textData = [
      createText({
        x: left + width / 2,
        y: top + height / 2,
        value,
        style: this.style.text,
        position: 'center',
      }),
    ]
  }

  draw() {
    const areaData = {
      data: this.areaData,
      fill: this.areaData.map(({color}) => color),
      ...this.style.area,
    }
    const backgroundData = {
      data: this.backgroundData,
      ...this.style.background,
    }
    const textData = {
      data: this.textData,
      ...this.style.text,
    }

    this.drawBasic({type: 'circle', data: [backgroundData], sublayer: 'background'})
    this.drawBasic({type: 'area', data: [areaData]})
    this.drawBasic({type: 'text', data: [textData]})
  }
}