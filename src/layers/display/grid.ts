import {LayerBase} from '../base'
import {DataTableList} from '../../data'
import {drag, max, range, select} from 'd3'
import {createStyle, elClass, validateAndCreateData} from '../helpers'
import {isSvgCntr, tableListToObjects} from '../../utils'
import {
  ChartContext,
  DrawerData,
  ElConfig,
  LayerGridOptions,
  LayerGridStyle,
  LineDrawerProps,
  RectDrawerProps,
} from '../../types'

type DataKey = 'width' | 'height'

const defaultStyle: LayerGridStyle = {
  draggable: true,
  sangerColumn: 12,
  sangerGap: 4,
  box: {
    strokeWidth: 1,
  },
  gridLine: {
    stroke: 'gray',
    strokeWidth: 1,
  },
}

export class LayerGrid extends LayerBase<LayerGridOptions> {
  private _data: Maybe<DataTableList>

  private _style = defaultStyle

  private boxData: DrawerData<RectDrawerProps>[] = []

  private gridLineData: DrawerData<LineDrawerProps>[][] = []

  get data() {
    return this._data
  }

  get style() {
    return this._style
  }

  constructor(options: LayerGridOptions, context: ChartContext) {
    super({options, context, sublayers: ['box', 'gridLine']})
  }

  setData(data: LayerGrid['data']) {
    this._data = validateAndCreateData('tableList', this.data, data)

    if (!this.data) {
      throw new Error('Invalid data')
    }

    ;['width', 'height'].map((key) => {
      if (!this.data?.headers.includes(key)) {
        throw new Error(`DataTableList lost specific column "${key}"`)
      }
    })
  }

  setScale() {}

  setStyle(style: LayerGridStyle) {
    this._style = createStyle(defaultStyle, this._style, style)
  }

  update() {
    if (!this.data) {
      throw new Error('Invalid data')
    }

    const {source} = this.data,
      {sangerColumn: sanger = 12, sangerGap: gap = 0} = this.style,
      {width, height, left, top, bottom, right} = this.options.layout,
      unitWidth = (width - (sanger - 1) * gap) / sanger,
      unitHeight = (height - (sanger - 1) * gap) / sanger,
      data = tableListToObjects<DataKey>(source)

    this.boxData.length = 0
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

    const columnHeight = new Array<number>(sanger).fill(0)
    const placeBox = (width: number, height: number) => {
      let [optimalRow, optimalColumn] = [Infinity, Infinity]
      for (let i = 0; i < sanger - width + 1; i++) {
        const fitRow = max(columnHeight.slice(i, i + width)) ?? Infinity
        if (fitRow < optimalRow) {
          optimalRow = fitRow
          optimalColumn = i
        }
      }
      for (let i = optimalColumn; i < optimalColumn + width; i++) {
        columnHeight[i] = optimalRow + height
      }
      return [optimalRow, optimalColumn]
    }

    data.forEach(({width, height}, i) => {
      const [optimalRow, optimalColumn] = placeBox(Number(width), Number(height))
      this.boxData[i] = {
        x: left + optimalColumn * (unitWidth + gap),
        y: top + optimalRow * (unitHeight + gap),
        width: Number(width) * unitWidth + (Number(width) - 1) * gap,
        height: Number(height) * unitHeight + (Number(height) - 1) * gap,
      }
    })
  }

  draw() {
    const boxData = {
      data: this.boxData,
      transformOrigin: 'center',
      ...this.style.box,
    }
    const lineData = this.gridLineData.map((group) => ({
      data: group,
      ...this.style.gridLine,
    }))

    this.drawBasic({type: 'rect', data: [boxData], sublayer: 'box'})
    this.drawBasic({type: 'line', data: lineData, sublayer: 'gridLine'})
    this.style.draggable && this.activeDrag()
  }

  activeDrag() {
    if (isSvgCntr(this.root)) {
      this.root.selectAll<Element, any>(elClass('box', true)).call(
        drag<Element, ElConfig & DrawerData<RectDrawerProps>>()
          .on('start', function dragStarted() {
            select(this).attr('stroke', 'black')
          })
          .on('drag', function dragged(event: MouseEvent, d) {
            select(this)
              .raise()
              .attr('x', (d.x = event.x))
              .attr('y', (d.y = event.y))
          })
          .on('end', function dragEnded() {
            select(this).attr('stroke', null)
          })
      )
    }
  }
}
