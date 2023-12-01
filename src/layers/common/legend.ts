import {cloneDeep, max, sum} from 'lodash'
import {EVENT_KEY} from '../../core'
import {DataBase, DataTableList} from '../../data'
import {
  CircleDrawerProps,
  DrawerData,
  ElConfig,
  LayerInstance,
  LayerLegendStyle,
  LayerOptions,
  LayerStyle,
  LegendCache,
  LegendData,
  LineDrawerProps,
  PolyDrawerProps,
  RectDrawerProps,
  TextDrawerProps,
} from '../../types'
import {
  createStar,
  formatNumber,
  getTextWidth,
  mergeAlpha,
  robustRange,
  ungroup,
} from '../../utils'
import {LayerBase} from '../base'
import {createStyle, createText} from '../helpers'

type Key = 'interactive' | 'circle' | 'rect' | 'polygon' | 'line' | 'text'

const defaultStyle: LayerLegendStyle = {
  maxColumn: 10,
  align: ['end', 'start'],
  offset: [0, 0],
  gap: [5, 10],
  shapeSize: 12,
  shape: {},
  text: {
    fontSize: 12,
  },
}

export class LayerLegend extends LayerBase<Key> {
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

  private disabledColor: string

  private legendDataGroup: LegendData[] = []

  protected textData: (DrawerData<TextDrawerProps> & {
    textWidth: number
  })[] = []

  protected lineData: (DrawerData<LineDrawerProps> & {
    stroke: string
    strokeWidth: number
    strokeDasharray?: string
  })[] = []

  protected rectData: (DrawerData<RectDrawerProps> & {
    fill: string
  })[] = []

  protected circleData: (DrawerData<CircleDrawerProps> & {
    fill?: string
    stroke?: string
    strokeWidth?: number
  })[] = []

  protected polygonData: (DrawerData<PolyDrawerProps> & {
    fill: string
  })[] = []

  protected interactiveData: DrawerData<RectDrawerProps>[] = []

  get data() {
    return this._data
  }

  get style() {
    return this._style
  }

  constructor(options: LayerOptions) {
    super({
      options,
      sublayers: ['interactive', 'circle', 'rect', 'polygon', 'line', 'text'],
    })
    this.disabledColor = mergeAlpha(this.options.theme.text.fill, 0.3)
  }

  setStyle(style: LayerStyle<LayerLegendStyle>) {
    this._style = createStyle(this.options, defaultStyle, this.style, style)
  }

  bindLayers(originLayers: LayerInstance[]) {
    const data = this.data.source,
      {text} = this.options.theme,
      layers = originLayers.filter((layer) => layer.legendData)

    Object.keys(data).map((key) => (data[key as Keys<typeof data>].length = 0))

    this.legendDataGroup = layers.map((layer) => layer.legendData!)
    this.legendDataGroup.forEach(({legends}) => {
      data.text.push(...legends.map(({label}) => label))
      data.shape.push(...legends.map(({shape}) => shape))
      data.shapeColors.push(...legends.map(({color}) => color))
      data.textColors.push(...new Array(legends.length).fill(text.fill))
    })
    this.filter(layers)
    this.needRecalculated = true
  }

  private filter = (layers: LayerInstance[]) => {
    const data = this.data.source,
      colors = cloneDeep(data.shapeColors),
      originData = cloneDeep(layers.map((layer) => layer.data)),
      counts = this.legendDataGroup.map(({legends}) => legends.length),
      filterTypes = this.legendDataGroup.map(({filter}) => filter),
      colorMatrix = this.legendDataGroup.map(({colorMatrix}) => colorMatrix),
      active = new Array<boolean>(colors.length).fill(true)

    this.event.onWithOff(
      'click-interactive',
      EVENT_KEY,
      (d: {data: ElConfig}) => {
        const itemIndex = ungroup(d.data.source)?.itemIndex ?? -1,
          index = counts.findIndex(
            (_, i) => sum(counts.slice(0, i + 1)) > itemIndex
          ),
          start = counts.slice(0, index).reduce((prev, cur) => prev + cur, 0),
          layerData = originData[index],
          layer = layers[index],
          order: LegendCache = {
            type: filterTypes[index],
            colorMatrix: colorMatrix[index],
            mapping: {},
          }
        let filteredData = layerData

        if (!(layerData instanceof DataTableList)) return
        if (!active[itemIndex]) {
          active[itemIndex] = true
          data.shapeColors[itemIndex] = colors[itemIndex]
          data.textColors[itemIndex] = ungroup(this.style.text.fill)!
        } else {
          active[itemIndex] = false
          data.shapeColors[itemIndex] = this.disabledColor
          data.textColors[itemIndex] = this.disabledColor
        }

        try {
          if (filterTypes[index] === 'row') {
            const mapping = robustRange(start, start + counts[index] - 1).map(
              (i) => active[i]
            )

            filteredData = layerData.selectRows(
              mapping
                .map((v, i) => (v === true ? i : -1))
                .filter((v) => v !== -1)
            )
            layerData.lists[0].forEach(
              (category, i) => (order.mapping[category] = i)
            )
            filteredData.options.order = order
          }

          if (filterTypes[index] === 'column') {
            filteredData = layerData.select(
              layerData.headers.filter((_, i) => !i || active[start + i - 1])
            )
            layerData.headers
              .slice(1)
              .forEach((header, i) => (order.mapping[header] = i))
            filteredData.options.order = order
          }

          layer.setData(filteredData)
          this.options.rebuildScale({trigger: this, redraw: true})
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
      {maxColumn, shapeSize, offset, text} = this.style,
      [align, verticalAlign] = this.style.align ?? ['start', 'start'],
      [inner, outer] = this.style.gap ?? [0, 0],
      data = this.data.source,
      shapeWidth = shapeSize * 2,
      fontSize = ungroup(text.fontSize) ?? 12,
      maxHeight = Math.max(shapeSize, fontSize),
      textData = data.text.map((value) => formatNumber(value, text.format)),
      textWidths = textData.map((value) => getTextWidth(value, fontSize)),
      groupTextWidths = robustRange(0, maxColumn - 1).map(
        (column) =>
          max(textWidths.filter((_, i) => i % maxColumn === column)) ?? 0
      )

    this.textData = textData.map((value, i) => {
      const [row, column] = [Math.floor(i / maxColumn), i % maxColumn]
      return createText({
        x:
          left +
          outer * column +
          (shapeWidth + inner) * (column + 1) +
          sum(groupTextWidths.slice(0, column)),
        y: top + maxHeight / 2 + maxHeight * row + outer * row,
        style: this.style.text,
        position: 'right',
        value,
      })
    })

    const totalWidth = max(
        this.textData.map(({x, textWidth}) => x + textWidth!)
      )!,
      totalHeight = max(
        this.textData.map(({y}) => y - (maxHeight - fontSize) / 2)
      )!,
      leftX = width - totalWidth,
      leftY = height - totalHeight,
      offsetX = align === 'center' ? leftX / 2 : align === 'end' ? leftX : 0,
      offsetY =
        verticalAlign === 'center'
          ? leftY / 2
          : verticalAlign === 'end'
          ? leftY
          : 0

    this.textData = this.textData.map(({x, y, value, ...rest}) => ({
      ...rest,
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

    this.interactiveData = this.textData.map(({x, y}, i) => ({
      x: x - shapeWidth - inner,
      y: y - fontSize / 2 - maxHeight / 2,
      width: shapeWidth + inner + groupTextWidths[i % maxColumn],
      height: maxHeight,
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
        points: createStar(x - size, y - size / 2, size, size).map(
          ([x, y]) => ({x, y})
        ),
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
      opacity: 0,
    }
    const circleData = {
      data: this.circleData,
      ...this.style.shape,
      fill: this.circleData.map(({fill}) => fill || 'white'),
      stroke: this.circleData.map(({stroke}) => stroke!),
      strokeWidth: this.circleData.map(({strokeWidth}) => strokeWidth!),
    }
    const lineData = {
      data: this.lineData,
      ...this.style.shape,
      stroke: this.lineData.map(({stroke}) => stroke!),
      strokeWidth: this.lineData.map(({strokeWidth}) => strokeWidth!),
      strokeDasharray: this.lineData.map((datum) => datum.strokeDasharray!),
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
        color === this.disabledColor ? 'line-through' : 'none'
      ),
    }

    this.drawBasic({type: 'text', key: 'text', data: [textData]})
    this.drawBasic({type: 'rect', key: 'rect', data: [rectData]})
    this.drawBasic({type: 'line', key: 'line', data: [lineData]})
    this.drawBasic({type: 'circle', key: 'circle', data: [circleData]})
    this.drawBasic({type: 'polygon', key: 'polygon', data: [polygonData]})
    this.drawBasic({type: 'rect', key: 'interactive', data: [interactiveData]})
  }
}
