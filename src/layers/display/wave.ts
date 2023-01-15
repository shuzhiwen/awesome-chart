import {Graphics} from 'pixi.js'
import {LayerBase} from '../base'
import {createColorMatrix, createStyle, createText, validateAndCreateData} from '../helpers'
import {createSinusoidal, isSC} from '../../utils'
import {DataBase} from '../../data'
import {range} from 'd3'
import {
  AreaDrawerProps,
  ChartContext,
  CircleDrawerProps,
  DrawerData,
  LayerStyle,
  LayerWaveOptions,
  LayerWaveStyle,
  TextDrawerProps,
} from '../../types'

const defaultStyle: LayerWaveStyle = {
  wavelength: 50,
  amplitude: 20,
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
    fontWeight: '700',
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
    DrawerData<AreaDrawerProps> & {
      value: Meta
      color: string
    }
  >[] = []

  private backgroundData: DrawerData<CircleDrawerProps>[] = []

  private textData: DrawerData<TextDrawerProps>[] = []

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

    if (isSC(this.root)) {
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
      this.root.mask = new Graphics()
        .beginFill(0xffffff)
        .drawCircle(left + width / 2, top + height / 2, radius)
        .endFill()
    }
  }

  setData(data: LayerWave['data']) {
    this._data = validateAndCreateData('base', this.data, data)
  }

  setStyle(style: LayerStyle<LayerWaveStyle>) {
    this._style = createStyle(this.options, defaultStyle, this.style, style)
  }

  update() {
    if (!this.data) {
      throw new Error('Invalid data or scale')
    }

    const {value, maxValue} = this.data.source,
      {areaNumber = 1, wavelength = 0, amplitude = 0, areaGap = 0, area} = this.style,
      {left, width, height, top, bottom} = this.options.layout,
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
        top - amplitude / 2 + (1 - value / maxValue) * height,
        wavelength * (1 + (areaNumber - index) / areaNumber),
        amplitude,
        Math.round(20 / ((areaNumber - index) / areaNumber))
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
