import {LayerBase} from '../base'
import {createStyle, createText} from '../helpers'
import {DataBase, DataTableList} from '../../data'
import {cloneDeep, sum} from 'lodash'
import {ColorMatrix, createStar, formatNumber, getTextWidth, range, ungroup} from '../../utils'
import {
  ChartContext,
  CircleDrawerProps,
  DrawerDataShape,
  Layer,
  LayerLegendOptions,
  LayerLegendStyleShape,
  LegendDataShape,
  LegendShape,
  LineDrawerProps,
  PolyDrawerProps,
  RectDrawerProps,
  TextDrawerProps,
} from '../../types'

const disableColor = '#E2E3E588'

const animationKey = `animationKey-${new Date().getTime()}`

const defaultStyle: LayerLegendStyleShape = {
  align: 'end',
  verticalAlign: 'start',
  direction: 'horizontal',
  offset: [0, 0],
  gap: [5, 10],
  shapeSize: 12,
  shape: {},
  text: {
    fontSize: 12,
  },
}

export class LayerLegend extends LayerBase<LayerLegendOptions> {
  private _data = new DataBase<{
    text: Meta[]
    shape: LegendShape[]
    textColors: string[]
    shapeColors: string[]
  }>({
    text: [],
    shape: [],
    textColors: [],
    shapeColors: [],
  })

  private _style = defaultStyle

  private textData: DrawerDataShape<TextDrawerProps>[] = []

  private lineData: (DrawerDataShape<LineDrawerProps> & {
    stroke?: string
    strokeWidth?: number
    strokeDasharray?: string
  })[] = []

  private rectData: (DrawerDataShape<RectDrawerProps> & {
    fill?: string
  })[] = []

  private circleData: (DrawerDataShape<CircleDrawerProps> & {
    fill?: string
    stroke?: string
    strokeWidth?: number
  })[] = []

  private polygonData: (DrawerDataShape<PolyDrawerProps> & {
    fill?: string
  })[] = []

  private interactiveData: (DrawerDataShape<RectDrawerProps> & {
    source: {index: number}
  })[] = []

  private legendDataGroup: LegendDataShape[] = []

  get data() {
    return this._data
  }

  get style() {
    return this._style
  }

  constructor(options: LayerLegendOptions, context: ChartContext) {
    super({
      context,
      options,
      sublayers: ['interactive', 'circle', 'rect', 'polygon', 'line', 'text'],
    })
  }

  setData() {}

  setScale() {}

  setStyle(style: LayerLegendStyleShape) {
    this._style = createStyle(defaultStyle, this.style, style)
  }

  bindLayers(originLayers: Layer[]) {
    const data = this.data.source,
      layers = originLayers.filter((layer) => layer.legendData)

    Object.values(data).map((item) => item.length === 0)

    this.legendDataGroup = layers.map((layer) => cloneDeep(layer.legendData)!)
    this.legendDataGroup.forEach(({legends}) => {
      data.text.push(...(legends?.map(({label}) => label) ?? []))
      data.shape.push(...(legends?.map(({shape}) => shape) ?? []))
      data.shapeColors.push(...(legends?.map(({color}) => color) ?? []))
      data.textColors.push(...new Array(legends?.length).fill('white'))
    })
    this.filter(layers)
  }

  private filter = (layers: Layer[]) => {
    const data = this.data.source,
      {bindCoordinate} = this.options,
      colors = cloneDeep(data.shapeColors),
      originData = cloneDeep(layers.map((layer) => layer.data)),
      counts = this.legendDataGroup.map(({legends}) => legends?.length),
      filterTypes = this.legendDataGroup.map(({filter}) => filter),
      colorMatrix = this.legendDataGroup.map(({colorMatrix}) => colorMatrix),
      active = new Array<boolean>(colors.length).fill(true)

    this.event.onWithOff(
      'mousedown-interactive',
      animationKey,
      (object: {data: {source: {index: number}}}) => {
        const {index} = object.data.source,
          layerIndex = counts.findIndex((_, i) => sum(counts.slice(0, i + 1)) > index),
          start = counts.slice(0, layerIndex).reduce((prev, cur) => prev + cur, 0),
          layerData = originData[layerIndex],
          layer = layers[layerIndex],
          order: {
            type: ArrayItem<typeof filterTypes>
            mapping: Record<Meta, number>
            colorMatrix: ColorMatrix
          } = {
            type: filterTypes[layerIndex],
            colorMatrix: colorMatrix[layerIndex],
            mapping: {},
          }
        let filteredData = layerData

        if (!(layerData instanceof DataTableList)) {
          return
        }

        if (!active[index]) {
          active[index] = true
          data.shapeColors[index] = colors[index]
          data.textColors[index] = ungroup(this.style.text?.fill) || 'white'
        } else {
          active[index] = false
          data.shapeColors[index] = disableColor
          data.textColors[index] = disableColor
        }

        try {
          if (filterTypes[layerIndex] === 'row') {
            const mapping = range(start, start + counts[layerIndex] - 1).map((i) => active[i])

            filteredData = layerData.filterRows(
              mapping.map((v, i) => (v === true ? i : -1)).filter((v) => v !== -1)
            )
            layerData.lists[0].forEach((category, i) => (order.mapping[category] = i))
            filteredData.options.order = order
          }

          if (filterTypes[layerIndex] === 'column') {
            filteredData = layerData.select(
              layerData.headers.filter((_, i) => !i || active[start + i - 1])
            )
            layerData.headers.slice(1).forEach((header, i) => (order.mapping[header] = i))
            filteredData.options.order = order
          }

          layer.setData(filteredData)
          bindCoordinate({trigger: this, redraw: true})
          this.needRecalculated = true
          this.draw()
        } catch (error) {
          this.log.warn('Legend Data filtering error', error)
        }
      }
    )
  }

  update() {
    if (this.data.source.shape.length === 0) {
      return
    }

    const {left, top, width, height} = this.options.layout,
      {align, verticalAlign, direction, shapeSize = 5, offset = [0, 0], gap, text} = this.style,
      [inner, outer] = gap!,
      data = this.data.source,
      shapeWidth = shapeSize * 2,
      fontSize = ungroup(text?.fontSize) ?? 12,
      maxHeight = Math.max(shapeSize, ungroup(fontSize)!),
      textData = data.text.map((value) => formatNumber(value, text?.format)),
      textWidths = textData.map((value) => getTextWidth(value, fontSize))
    let [totalWidth, totalHeight] = [0, 0]

    if (direction === 'horizontal') {
      this.textData = textData.map((value, i) =>
        createText({
          x: left + (shapeWidth + inner) * (i + 1) + outer * i + sum(textWidths.slice(0, i)),
          y: top + maxHeight / 2,
          style: this.style.text,
          position: 'right',
          value,
        })
      )
    } else if (direction === 'vertical') {
      this.textData = textData.map((value, i) =>
        createText({
          x: left + shapeWidth + inner,
          y: top + maxHeight / 2 + maxHeight * i + outer * i,
          style: this.style.text,
          position: 'right',
          value,
        })
      )
    }

    const {x, y, value} = this.textData.at(-1)!

    if (direction === 'horizontal') {
      totalWidth = x - left + getTextWidth(value, fontSize)
      totalHeight = maxHeight
    } else if (direction === 'vertical') {
      totalWidth = shapeWidth + inner + Math.max(...textWidths)
      totalHeight = y - fontSize / 2 + maxHeight / 2 - top
    }

    const leftX = width - totalWidth,
      leftY = height - totalHeight,
      offsetX = align === 'middle' ? leftX / 2 : align === 'end' ? leftX : 0,
      offsetY = verticalAlign === 'middle' ? leftY / 2 : verticalAlign === 'end' ? leftY : 0

    this.textData = this.textData.map(({x, y, value}) => ({
      x: x + offset[0] + offsetX,
      y: y - offset[1] + offsetY,
      value,
    }))

    this.lineData = []
    this.rectData = []
    this.circleData = []
    this.polygonData = []

    data.shape.forEach((shape, i) =>
      this.createShape({
        shape,
        size: shapeSize,
        x: this.textData[i].x - inner,
        y: this.textData[i].y - fontSize / 2,
        color: data.shapeColors[i],
      })
    )

    this.interactiveData = this.textData.map(({x, y, value}, i) => ({
      x: x - shapeWidth - inner,
      y: y - fontSize / 2 - maxHeight / 2,
      width: shapeWidth + inner + textWidths[i],
      height: maxHeight,
      source: {value, index: i},
    }))
  }

  private createShape = (props: {
    shape: LegendShape
    x: number
    y: number
    size: number
    color: string
  }) => {
    const {shape, x, y, size, color} = props

    if (shape === 'rect') {
      this.rectData.push({
        x: x - size * 2,
        y: y - size / 2,
        width: size * 2,
        height: size,
        fill: color,
      })
    } else if (shape === 'circle') {
      this.circleData.push({
        x: x - size / 2,
        y,
        r: size / 2,
        fill: color,
      })
    } else if (shape === 'brokenLine') {
      this.lineData.push(
        {
          x1: x - size * 2,
          x2: x - (size / 2) * 3,
          y1: y,
          y2: y,
          strokeWidth: size / 5,
          stroke: color,
        },
        {
          x1: x - size / 2,
          x2: x,
          y1: y,
          y2: y,
          strokeWidth: size / 5,
          stroke: color,
        }
      )
      this.circleData.push({
        x: x - size,
        y,
        r: size / 3,
        stroke: color,
        strokeWidth: size / 5,
      })
    } else if (shape === 'dottedLine') {
      this.lineData.push({
        x1: x - size * 2,
        x2: x,
        y1: y,
        y2: y,
        stroke: color,
        strokeWidth: size / 5,
        strokeDasharray: `${size / 4} ${size / 4}`,
      })
    } else if (shape === 'star') {
      this.polygonData.push({
        points: createStar(x - size, y - size / 2, size, size).map(([x, y]) => ({x, y})),
        centerX: x,
        centerY: y,
        fill: color,
      })
    }
  }

  draw() {
    const rectData = {
      data: this.rectData,
      ...this.style.shape,
      fill: this.rectData.map(({fill}) => fill!),
    }
    const interactiveData = {
      data: this.interactiveData,
      source: this.interactiveData.map(({source}) => source),
      fillOpacity: 0,
    }
    const circleData = {
      data: this.circleData,
      ...this.style.shape,
      fill: this.circleData.map(({fill}) => fill!),
      stroke: this.circleData.map(({stroke}) => stroke!),
      strokeWidth: this.circleData.map(({strokeWidth}) => strokeWidth!),
    }
    const lineData = {
      data: this.lineData,
      ...this.style.shape,
      stroke: this.lineData.map(({stroke}) => stroke!),
      strokeWidth: this.lineData.map(({strokeWidth}) => strokeWidth!),
      strokeDasharray: this.lineData.map(({strokeDasharray}) => strokeDasharray!),
    }
    const polygonData = {
      data: this.polygonData,
      ...this.style.shape,
      fill: this.polygonData.map(({fill}) => fill!),
    }
    const textData = {
      data: this.textData,
      ...this.style.text,
      fill: this.data.source.textColors,
      textDecoration: this.data.source.textColors.map((color) =>
        color === disableColor ? 'line-through' : 'none'
      ),
    }

    this.drawBasic({type: 'text', data: [textData]})
    this.drawBasic({type: 'rect', data: [rectData]})
    this.drawBasic({type: 'line', data: [lineData]})
    this.drawBasic({type: 'circle', data: [circleData]})
    this.drawBasic({type: 'polygon', data: [polygonData]})
    this.drawBasic({type: 'rect', data: [interactiveData], sublayer: 'interactive'})
  }
}
