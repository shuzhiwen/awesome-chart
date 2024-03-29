import {drag, max, range} from 'd3'
import {DataTableList} from '../../data'
import {
  Box,
  DrawerData,
  ElConfig,
  LayerGridStyle,
  LayerOptions,
  LayerStyle,
  LineDrawerProps,
  RectDrawerProps,
} from '../../types'
import {
  isBoxCollision,
  isCC,
  tableListToObjects,
  ungroup,
  uuid,
} from '../../utils'
import {LayerBase} from '../base'
import {
  checkColumns,
  createData,
  createStyle,
  elClass,
  selector,
} from '../helpers'

type Key = 'box' | 'gridLine' | 'placeholder'

type DataKey = 'width' | 'height' | 'key'

type ElData = ElConfig & {source: {meta: ArrayItem<LayerGrid['boxData']>}}

type GridBox = Box & {index: number; event: DragEvent; source: ElData['source']}

type DragEvent = {x: number; y: number; sourceEvent: {target: SVGRectElement}}

const defaultStyle: LayerGridStyle = {
  placeMode: 'position',
  draggable: true,
  sangerColumn: 12,
  sangerGap: 4,
  placeholder: {
    fill: 'orange',
    fillOpacity: 0.3,
  },
  gridLine: {
    stroke: 'gray',
    strokeWidth: 1,
  },
  box: {},
}

const getLengthFromIndex = (index: number, unit: number, gap: number) => {
  return index * unit + (index - 1) * gap
}

const getIndexFromLength = (length: number, unit: number, gap: number) => {
  return Math.round((gap + length) / (unit + gap))
}

const placeBoxDelay = (
  width: number,
  height: number,
  columnHeight: number[]
) => {
  let [optimalRow, optimalColumn] = [Infinity, Infinity]
  const apply = () => {
    for (let i = optimalColumn; i < optimalColumn + width; i++) {
      columnHeight[i] = optimalRow + height
    }
  }

  for (let i = 0; i < columnHeight.length - width + 1; i++) {
    const fitRow = max(columnHeight.slice(i, i + width)) ?? Infinity
    if (fitRow < optimalRow) {
      optimalRow = fitRow
      optimalColumn = i
    }
  }

  return {x: optimalColumn, y: optimalRow, apply}
}

const placeBox = (width: number, height: number, columnHeight: number[]) => {
  const {apply, ...rest} = placeBoxDelay(width, height, columnHeight)
  apply()
  return rest
}

export class LayerGrid extends LayerBase<Key> {
  private _data: Maybe<DataTableList>

  private _style = defaultStyle

  private insertIndex = -1

  protected boxData: (DrawerData<RectDrawerProps> & {
    meta: DrawerData<RectDrawerProps> & {dimension: Meta}
  })[] = []

  protected gridLineData: DrawerData<LineDrawerProps>[][] = []

  protected placeholderData: DrawerData<RectDrawerProps>

  get data() {
    return this._data
  }

  get style() {
    return this._style
  }

  constructor(options: LayerOptions) {
    super({options, sublayers: ['box', 'gridLine', 'placeholder']})
    this.placeholderData = {width: 0, height: 0, x: 0, y: 0}
  }

  setData(data: LayerGrid['data']) {
    this.placeholderData = {width: 0, height: 0, x: 0, y: 0}
    this._data = createData('tableList', this.data, data, (data) => {
      if (!data) return

      checkColumns(data, ['width', 'height'])

      if (!data.headers.includes('key')) {
        return new DataTableList(
          data.source.map((item, i) => item.concat([i === 0 ? 'key' : uuid()]))
        )
      }
    })
  }

  setStyle(style: LayerStyle<LayerGridStyle>) {
    this._style = createStyle(this.options, defaultStyle, this.style, style)
  }

  update(box: Maybe<GridBox>) {
    if (!this.data) {
      throw new Error('Invalid data')
    }

    const {sangerColumn, sangerGap: gap, placeMode} = this.style,
      {width, height, left, top, bottom, right} = this.options.layout,
      unitWidth = (width - (sangerColumn - 1) * gap) / sangerColumn,
      unitHeight = (height - (sangerColumn - 1) * gap) / sangerColumn,
      columnHeight = new Array<number>(sangerColumn).fill(0),
      data = tableListToObjects<DataKey>(this.data.source)

    this.boxData.length = 0
    this.insertIndex = data.length - 1
    this.gridLineData = [
      range(1, sangerColumn).map((index) => ({
        x1: left + (unitWidth + gap) * index,
        x2: left + (unitWidth + gap) * index,
        y1: top,
        y2: bottom,
      })),
      range(1, sangerColumn).map((index) => ({
        x1: left,
        x2: right,
        y1: top + (unitHeight + gap) * index,
        y2: top + (unitHeight + gap) * index,
      })),
    ]

    if (box) {
      const rearrange =
        placeMode === 'collision'
          ? this.rearrangeByCollision
          : this.rearrangeByPosition

      rearrange.call(this, data, box, ({x, y}) => {
        this.placeholderData = {
          x: left + x * (unitWidth + gap),
          y: top + y * (unitHeight + gap),
          width: getLengthFromIndex(box.width, unitWidth, gap),
          height: getLengthFromIndex(box.height, unitHeight, gap),
        }
      })
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
          meta: {...box, dimension: item.key},
        }
        for (let i = x; i < x + width; i++) {
          columnHeight[i] = y + height
        }
      } else {
        const [width, height] = [Number(item.width), Number(item.height)],
          {x, y} = placeBox(width, height, columnHeight)

        this.boxData[i] = {
          x: left + x * (unitWidth + gap),
          y: top + y * (unitHeight + gap),
          width: getLengthFromIndex(width, unitWidth, gap),
          height: getLengthFromIndex(height, unitHeight, gap),
          meta: {x, y, width, height, dimension: item.key},
        }
      }
    })
  }

  draw() {
    const boxData = this.boxData.map((box, i) => ({
      data: [box],
      ...this.style.box,
      disableUpdateAnimation: i === this.insertIndex,
    }))
    const placeholderData = {
      data: [this.placeholderData],
      ...this.style.placeholder,
      evented: false,
    }
    const lineData = this.gridLineData.map((group) => ({
      data: group,
      ...this.style.gridLine,
    }))

    this.drawBasic({type: 'rect', key: 'placeholder', data: [placeholderData]})
    this.drawBasic({type: 'rect', key: 'box', data: boxData})
    this.drawBasic({type: 'line', key: 'gridLine', data: lineData})

    if (this.style.draggable) {
      if (isCC(this.root)) {
        this.log.warn('Not support canvas drag')
        return
      }

      const dragBehavior = drag<Element, ElData>()
        .on('drag', this.dragged.bind(this))
        .on('end', this.dragEnded.bind(this))

      selector
        .getChildren(this.root, elClass('box'))
        .call(dragBehavior as AnyFunction)
    }
  }

  private rearrangeByCollision(
    data: Record<DataKey, Meta>[],
    box: GridBox,
    generatePlaceHolder: (props: {x: number; y: number}) => void
  ) {
    const {sangerColumn} = this.style,
      columnHeight = new Array<number>(sangerColumn).fill(0),
      target = data.splice(box.index, 1)

    for (let i = 0; i < data.length; i++) {
      const [width, height] = [Number(data[i].width), Number(data[i].height)],
        {x, y, apply} = placeBoxDelay(width, height, columnHeight)

      if (isBoxCollision(box, {x, y, width, height})) {
        this.insertIndex = i
        break
      }

      apply()
    }

    data.splice(this.insertIndex, 0, ...target)
    generatePlaceHolder(placeBoxDelay(box.width, box.height, columnHeight))
  }

  private rearrangeByPosition(
    data: Record<DataKey, Meta>[],
    box: GridBox,
    generatePlaceHolder: (props: {x: number; y: number}) => void
  ) {
    const {sangerColumn} = this.style,
      columnHeight1 = new Array<number>(sangerColumn).fill(0),
      columnHeight2 = new Array<number>(sangerColumn).fill(0),
      target = data.splice(box.index, 1),
      key = box.source.meta.dimension!

    this.insertIndex = data
      .map((item) => {
        const [width, height] = [Number(item.width), Number(item.height)],
          {x, y} = placeBox(width, height, columnHeight1)
        return {x, y, width, height, key: item.key}
      })
      .concat({...box, x: box.x - 1, y: box.y - 1, key})
      .sort((a, b) => a.x - b.x + a.y - b.y)
      .findIndex((item) => item.key === key)

    for (let i = 0; i < this.insertIndex; i++) {
      placeBox(Number(data[i].width), Number(data[i].height), columnHeight2)
    }

    data.splice(this.insertIndex, 0, ...target)
    generatePlaceHolder(placeBoxDelay(box.width, box.height, columnHeight2))
    return
  }

  private dragged(event: DragEvent, d: ElData) {
    const {groupIndex: index, meta} = d.source,
      {sangerColumn: sanger, sangerGap: gap} = this.style,
      {width, height, left, top} = this.options.layout,
      unitWidth = (width - (sanger - 1) * gap) / sanger,
      unitHeight = (height - (sanger - 1) * gap) / sanger,
      x = Math.round((event.x - left) / (unitWidth + gap)),
      y = Math.round((event.y - top) / (unitHeight + gap))

    this.needRecalculated = true
    this.update({...meta, x, y, event, index, source: d.source})
    this.draw()
  }

  private dragEnded(_: DragEvent, d: ElData) {
    const rawTableList = this.data!.rawTableListWithHeaders,
      target = rawTableList.splice(ungroup(d.source)?.groupIndex! + 1, 1)[0]

    if (this.boxData[this.insertIndex]) {
      Object.assign(this.boxData[this.insertIndex], this.placeholderData)
      rawTableList.splice(this.insertIndex + 1, 0, target)
    }

    this.insertIndex = -1
    this.setData(new DataTableList(rawTableList))
    this.draw()
  }
}
