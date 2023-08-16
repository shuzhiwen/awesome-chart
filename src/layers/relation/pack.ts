import {hierarchy, HierarchyNode, max, pack, range} from 'd3'
import {DataRelation} from '../../data'
import {
  ChartContext,
  CircleDrawerProps,
  DrawerData,
  ElConfig,
  LayerPackOptions,
  LayerPackStyle,
  LayerStyle,
  Node,
  TextDrawerProps,
} from '../../types'
import {uuid} from '../../utils'
import {LayerBase} from '../base'
import {
  createColorMatrix,
  createLimitText,
  createStyle,
  createText,
  validateAndCreateData,
} from '../helpers'

type Key = 'circle' | 'text'

const defaultOptions: Partial<LayerPackOptions> = {
  variant: 'pack',
}

const defaultStyle: LayerPackStyle = {
  zoom: true,
  padding: 0,
}

export class LayerPack extends LayerBase<LayerPackOptions, Key> {
  private _data: Maybe<DataRelation>

  private _style = defaultStyle

  private textData: (DrawerData<TextDrawerProps> & {
    fontSize?: number
  })[][] = []

  private treeData: Maybe<HierarchyNode<Node>>

  private circleData: (DrawerData<CircleDrawerProps> & {
    meta: AnyObject
    value: Meta
    color?: string
  })[][] = []

  private zoomConfig: Maybe<{
    maxHeight: number
    view: Vec2
    offset: Vec2
    k: number
  }>

  get data() {
    return this._data
  }

  get style() {
    return this._style
  }

  constructor(options: LayerPackOptions, context: ChartContext) {
    super({
      context,
      options: {...defaultOptions, ...options},
      sublayers: ['circle', 'text'],
      interactive: ['circle'],
    })
  }

  setData(data: LayerPack['data']) {
    this._data = validateAndCreateData('relation', this.data, data)

    const {nodes} = this.data!,
      {layout} = this.options,
      {width, height} = layout

    const root = {
      id: uuid(),
      name: 'root',
      children: nodes.filter(({level}) => level === 0),
      value: 0,
    }
    this.treeData = hierarchy<Node>(root)
      .sum((d) => d.value!)
      .sort((a, b) => b.data.value! - a.data.value!)

    this.zoomConfig = {
      maxHeight: max(this.treeData.descendants().map(({height}) => height + 1)) ?? -1,
      view: [width, height],
      offset: [0, 0],
      k: 1,
    }
  }

  setStyle(style: LayerStyle<LayerPackStyle>) {
    this._style = createStyle(this.options, defaultStyle, this.style, style)
  }

  update() {
    if (!this.data || !this.zoomConfig || !this.treeData) {
      throw new Error('Invalid data')
    }

    const {layout, variant} = this.options,
      {left, top} = layout,
      {padding = 0, circle, text} = this.style,
      {view, offset, maxHeight} = this.zoomConfig,
      nodes = pack<Node>().size(view).padding(padding)(this.treeData).descendants(),
      circleData = nodes.map(({x, y, data, ...rest}) => ({
        ...rest,
        value: data.name,
        x: x + left + offset[0],
        y: y + top + offset[1],
        meta: {[data.name]: [data.value]},
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
        variant === 'pack'
          ? createText({
              ...item,
              style: text,
              position: 'center',
            })
          : createLimitText({
              ...item,
              style: text,
              position: 'center',
              maxTextWidth: item.r * 2 * 0.9,
            })
      )
    )
  }

  draw() {
    const {variant} = this.options
    const {zoom, circle, text} = this.style
    const circleData = this.circleData.map((group) => ({
      data: group,
      ...circle,
      fill: group.map(({color}) => color!),
      fillOpacity: variant === 'wordCloud' ? 0 : circle?.fillOpacity,
    }))
    const textData = this.textData.map((group) => ({
      data: group,
      ...text,
      fontSize: variant === 'pack' ? text?.fontSize : group.flatMap(({fontSize}) => fontSize!),
    }))

    this.drawBasic({type: 'circle', key: 'circle', data: circleData})
    this.drawBasic({type: 'text', key: 'text', data: textData.slice(textData.length - 1)})

    if (zoom) {
      this.event.onWithOff('mousedown-circle', 'internal', this.zoom)
    }
  }

  private zoom = ({data}: {data: ElConfig}) => {
    const {cx, cy, rx, ry} = data as ElConfig<'ellipse'>,
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
