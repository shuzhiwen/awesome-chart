import {LayerBase} from '../base'
import {DataTableList} from '../../data'
import {drag, max, range} from 'd3'
import {createStyle, elClass, validateAndCreateData} from '../helpers'
import {isCanvasCntr, isBoxCollision, tableListToObjects, ungroup, uuid} from '../../utils'
import {
  Box,
  ChartContext,
  DrawerData,
  ElConfig,
  LayerGridOptions,
  LayerGridStyle,
  LineDrawerProps,
  RectDrawerProps,
} from '../../types'

type DataKey = 'width' | 'height' | 'key'
type DragEvent = {x: number; y: number; sourceEvent: {target: SVGRectElement}}
type ElData = ElConfig & ArrayItem<LayerGrid['boxData']>

const defaultStyle: LayerGridStyle = {
  draggable: true,
  sangerColumn: 12,
  sangerGap: 4,
  placeholder: {
    fill: 'yellow',
    fillOpacity: 0.3,
  },
  gridLine: {
    stroke: 'gray',
    strokeWidth: 1,
  },
}

function getLengthFromIndex(index: number, unit: number, gap: number) {
  return index * unit + (index - 1) * gap
}

function getIndexFromLength(length: number, unit: number, gap: number) {
  return Math.round((gap + length) / (unit + gap))
}

export class LayerGrid extends LayerBase<LayerGridOptions> {
  private _data: Maybe<DataTableList>

  private _style = defaultStyle

  private insertIndex = -1

  private boxData: (DrawerData<RectDrawerProps> & {
    source: Box & {dimension: Meta}
  })[] = []

  private gridLineData: DrawerData<LineDrawerProps>[][] = []

  private placeholderData: DrawerData<RectDrawerProps>

  get data() {
    return this._data
  }

  get style() {
    return this._style
  }

  constructor(options: LayerGridOptions, context: ChartContext) {
    super({options, context, sublayers: ['box', 'gridLine', 'placeholder']})
    this.placeholderData = {width: 0, height: 0, x: 0, y: 0}
    this.setAnimation({
      placeholder: {update: {duration: 0, delay: 0}},
      box: {update: {duration: 0, delay: 0}},
    })
  }

  setData(data: LayerGrid['data']) {
    this._data = validateAndCreateData('tableList', this.data, data, (data) => {
      if (!data) {
        throw new Error('Invalid data')
      }

      ;['width', 'height'].map((key) => {
        if (!data?.headers.includes(key)) {
          throw new Error(`DataTableList lost specific column "${key}"`)
        }
      })

      return new DataTableList(
        data.source.map((item, i) => item.concat([i === 0 ? 'key' : uuid()]))
      )
    })
  }

  setScale() {}

  setStyle(style: LayerGridStyle) {
    this._style = createStyle(defaultStyle, this._style, style)
  }

  update(box?: Box & {itemIndex: number; event: DragEvent}) {
    if (!this.data) {
      throw new Error('Invalid data')
    }

    const {source} = this.data,
      {sangerColumn: sanger = 12, sangerGap: gap = 0} = this.style,
      {width, height, left, top, bottom, right} = this.options.layout,
      unitWidth = (width - (sanger - 1) * gap) / sanger,
      unitHeight = (height - (sanger - 1) * gap) / sanger,
      columnHeight = new Array<number>(sanger).fill(0),
      data = tableListToObjects<DataKey>(source)

    this.boxData.length = 0
    this.insertIndex = data.length - 1
    this.gridLineData = [
      range(1, sanger).map((index) => ({
        x1: left + (unitWidth + gap) * index,
        x2: left + (unitWidth + gap) * index,
        y1: top,
        y2: bottom,
      })),
      range(1, sanger).map((index) => ({
        x1: left,
        x2: right,
        y1: top + (unitHeight + gap) * index,
        y2: top + (unitHeight + gap) * index,
      })),
    ]

    if (box) {
      const columnHeight = new Array<number>(sanger).fill(0),
        target = data.splice(box.itemIndex, 1)
      let [insertX, insertY] = [-1, -1]

      for (let i = 0; i < data.length; i++) {
        const [width, height] = [Number(data[i].width), Number(data[i].height)],
          {x, y, apply} = this.placeBox(width, height, columnHeight)

        if (isBoxCollision(box, {x, y, width, height})) {
          this.insertIndex = i
          break
        } else {
          apply()
        }
      }

      const {x, y} = this.placeBox(box.width, box.height, columnHeight)

      ;[insertX, insertY] = [x, y]
      data.splice(this.insertIndex, 0, ...target)

      this.placeholderData = {
        x: left + insertX * (unitWidth + gap),
        y: top + insertY * (unitHeight + gap),
        width: getLengthFromIndex(box.width, unitWidth, gap),
        height: getLengthFromIndex(box.height, unitHeight, gap),
      }
    }

    data.forEach((item, i) => {
      if (i === this.insertIndex && box) {
        const {width, height, event} = box,
          x = getIndexFromLength(this.placeholderData.x - left, unitWidth, gap),
          y = getIndexFromLength(this.placeholderData.y - top, unitHeight, gap)

        this.boxData[i] = {
          x: event.x,
          y: event.y,
          width: this.placeholderData.width,
          height: this.placeholderData.height,
          source: {...box, dimension: item.key},
        }
        for (let i = x; i < x + width; i++) {
          columnHeight[i] = y + height
        }
      } else {
        const [width, height] = [Number(item.width), Number(item.height)],
          {x, y, apply} = this.placeBox(width, height, columnHeight)

        apply()
        this.boxData[i] = {
          x: left + x * (unitWidth + gap),
          y: top + y * (unitHeight + gap),
          width: getLengthFromIndex(width, unitWidth, gap),
          height: getLengthFromIndex(height, unitHeight, gap),
          source: {x, y, width, height, dimension: item.key},
        }
      }
    })
  }

  draw() {
    const boxData = {
      data: this.boxData,
      transformOrigin: 'center',
      source: this.boxData.map(({source}) => source),
      ...this.style.box,
    }
    const placeholderData = {
      data: [this.placeholderData],
      transformOrigin: 'center',
      ...this.style.placeholder,
      evented: false,
    }
    const lineData = this.gridLineData.map((group) => ({
      data: group,
      ...this.style.gridLine,
    }))

    this.drawBasic({type: 'rect', data: [placeholderData], sublayer: 'placeholder'})
    this.drawBasic({type: 'rect', data: [boxData], sublayer: 'box'})
    this.drawBasic({type: 'line', data: lineData, sublayer: 'gridLine'})

    if (this.style.draggable) {
      if (isCanvasCntr(this.root)) {
        this.log.warn('Not support canvas drag')
        return
      }

      const dragBehavior = drag<Element, ElData>()
        .on('drag', this.dragged.bind(this))
        .on('end', this.dragEnded.bind(this))

      this.root.selectAll(elClass('box', true)).call(dragBehavior as any)
    }
  }

  private placeBox = (width: number, height: number, columnHeight: number[]) => {
    let [optimalRow, optimalColumn] = [Infinity, Infinity]

    for (let i = 0; i < columnHeight.length - width + 1; i++) {
      const fitRow = max(columnHeight.slice(i, i + width)) ?? Infinity
      if (fitRow < optimalRow) {
        optimalRow = fitRow
        optimalColumn = i
      }
    }

    return {
      x: optimalColumn,
      y: optimalRow,
      apply: () => {
        for (let i = optimalColumn; i < optimalColumn + width; i++) {
          columnHeight[i] = optimalRow + height
        }
      },
    }
  }

  private dragged(event: DragEvent, d: ElData) {
    const {x, y} = event,
      {width, height, itemIndex = 0} = ungroup(d.source),
      {sangerColumn: sanger = 12, sangerGap: gap = 0} = this.style,
      {width: layoutWidth, height: layoutHeight, left, top} = this.options.layout,
      unitWidth = (layoutWidth - (sanger - 1) * gap) / sanger,
      unitHeight = (layoutHeight - (sanger - 1) * gap) / sanger,
      row = Math.round((y - top) / (unitHeight + gap)),
      column = Math.round((x - left) / (unitWidth + gap))

    this.needRecalculated = true
    this.update({x: column, y: row, width, height, event, itemIndex})
    this.draw()
  }

  private dragEnded(_: DragEvent, d: ElData) {
    const {source} = this.data!,
      target = source.splice(ungroup(d.source).itemIndex! + 1, 1)[0]

    if (this.boxData[this.insertIndex]) {
      Object.assign(this.boxData[this.insertIndex], this.placeholderData)
      source.splice(this.insertIndex + 1, 0, target)
    }

    this.setData(new DataTableList(source))
    this.draw()
  }
}
