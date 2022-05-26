import {hierarchy, HierarchyNode, max, pack, range} from 'd3'
import {LayerBase} from '../base'
import {DataRelation} from '../../data'
import {isSvgContainer, uuid} from '../../utils'
import {createColorMatrix, createStyle, createText, validateAndCreateData} from '../helpers'
import {
  ChartContext,
  DrawerDataShape,
  LayerPackStyleShape,
  LayerPackOptions,
  TextDrawerProps,
  CircleDrawerProps,
  EllipseDrawerProps,
  Node,
} from '../../types'

const animationKey = `animationKey-${new Date().getTime()}`

const defaultStyle: LayerPackStyleShape = {
  zoom: true,
  padding: 0,
}

export class LayerPack extends LayerBase<LayerPackOptions> {
  private _data: Maybe<DataRelation>

  private _style = defaultStyle

  private textData: DrawerDataShape<TextDrawerProps>[][] = []

  private treeData: Maybe<HierarchyNode<Node>>

  private circleData: (DrawerDataShape<CircleDrawerProps> & {
    value: Meta
    color?: string
  })[][] = []

  private zoomConfig: Maybe<{
    maxHeight: number
    view: [number, number]
    offset: [number, number]
    k: number
  }>

  get data() {
    return this._data
  }

  get style() {
    return this._style
  }

  constructor(options: LayerPackOptions, context: ChartContext) {
    super({options, context, sublayers: ['circle', 'text'], tooltipTargets: ['circle']})
  }

  setData(data: LayerPack['data']) {
    this._data = validateAndCreateData('relation', this.data, data)

    const {nodes} = this.data!,
      {width, height} = this.options.layout,
      root = {
        id: uuid(),
        name: 'root',
        children: nodes.filter(({level}) => level === 0),
        value: 0,
      }

    this.treeData = hierarchy(root)
      .sum((d) => d.value)
      .sort((a, b) => b.data.value - a.data.value)
    this.zoomConfig = {
      maxHeight: max(this.treeData.descendants().map(({height}) => height + 1)) ?? -1,
      view: [width, height],
      offset: [0, 0],
      k: 1,
    }
  }

  setScale() {}

  setStyle(style: LayerPackStyleShape) {
    this._style = createStyle(defaultStyle, this._style, style)
  }

  update() {
    if (!this.data || !this.zoomConfig || !this.treeData) {
      throw new Error('Invalid data')
    }

    const {left, top} = this.options.layout,
      {padding = 0, circle, text} = this.style,
      {view, offset, maxHeight} = this.zoomConfig,
      nodes = pack<Node>().size(view).padding(padding)(this.treeData).descendants(),
      circleData = nodes.map(({x, y, data, ...rest}) => ({
        ...rest,
        x: x + left + offset[0],
        y: y + top + offset[1],
        value: data.name,
      }))

    // classify circles by height
    this.circleData = range(0, maxHeight)
      .map((value) => circleData.filter(({height}) => height === value))
      .reverse()

    const colorMatrix = createColorMatrix({
      layer: this,
      row: this.circleData.length,
      column: 1,
      theme: circle?.fill,
    })

    this.circleData.forEach((group, i) =>
      group.forEach((item) => {
        item.color = colorMatrix.get(i, 0)
      })
    )

    this.textData = this.circleData.map((group) =>
      group.map((item) =>
        createText({
          ...item,
          style: text,
          position: 'center',
        })
      )
    )
  }

  draw() {
    const {zoom, circle, text} = this.style
    const circleData = this.circleData.map((group) => ({
      data: group,
      source: group,
      ...circle,
      fill: group.map(({color}) => color!),
    }))
    const textData = this.textData.map((group) => ({
      data: group,
      ...text,
    }))

    this.drawBasic({type: 'circle', data: circleData})
    // only show the innermost label to prevent occlusion
    this.drawBasic({type: 'text', data: textData.slice(textData.length - 1)})

    if (zoom && isSvgContainer(this.root)) {
      this.event.onWithOff('click-circle', animationKey, this.zoom)
    } else {
      this.log.warn('Zoom pack not support for canvas')
    }
  }

  private zoom = ({data}: {data: DrawerDataShape<EllipseDrawerProps>}) => {
    const {cx, cy, rx, ry} = data,
      {left, top, width, height} = this.options.layout,
      {k: prevK = -1, offset: [prevX, prevY] = [0, 0], maxHeight = -1} = this.zoomConfig!,
      nextK = (Math.min(width, height) / (rx + ry)) * prevK,
      nextX = (width / 2 - (cx - prevX - left) / prevK) * nextK - (width * (nextK - 1)) / 2,
      nextY = (height / 2 - (cy - prevY - top) / prevK) * nextK - (height * (nextK - 1)) / 2

    this.zoomConfig = {
      maxHeight,
      k: nextK,
      offset: [nextX, nextY],
      view: [width * nextK, height * nextK],
    }

    this.needRecalculated = true
    this.draw()
  }
}
