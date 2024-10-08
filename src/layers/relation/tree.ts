import {max, scalePoint} from 'd3'
import {DataRelation} from '../../data'
import {
  CircleDrawerProps,
  DrawerData,
  LayerOptions,
  LayerStyle,
  LayerTreeScale,
  LayerTreeStyle,
  LineDrawerProps,
  Node,
  TextDrawerProps,
} from '../../types'
import {robustRange} from '../../utils'
import {LayerBase} from '../base'
import {
  createColorMatrix,
  createData,
  createScale,
  createStyle,
  createText,
} from '../helpers'

type Key = 'node' | 'edge' | 'text'

const defaultStyle: LayerTreeStyle = {
  direction: 'horizontal',
  curveType: 'curveBumpX',
  labelOffset: 5,
  labelPosition: 'outer',
  align: 'end',
  nodeSize: 10,
  edge: {
    strokeWidth: 2,
  },
  node: {},
  text: {},
}

export class LayerTree extends LayerBase<Key> {
  private _data: Maybe<DataRelation>

  private _scale: LayerTreeScale

  private _style = defaultStyle

  private maxOrder = -1

  private groups: (Node & {order?: number})[][] = []

  protected textData: DrawerData<TextDrawerProps>[][] = []

  protected nodeData: (DrawerData<CircleDrawerProps> &
    Pick<Node, 'id' | 'name' | 'value'> & {
      meta: AnyObject
      color: string
      parents: (Node &
        Partial<{
          order: number
          min: number
          max: number
          x: number
          y: number
        }>)[]
    })[][] = []

  protected edgeData: (DrawerData<LineDrawerProps> & {
    color: string
  })[][] = []

  get data() {
    return this._data
  }

  get scale() {
    return this._scale
  }

  get style() {
    return this._style
  }

  constructor(options: LayerOptions) {
    super({options, sublayers: ['node', 'edge', 'text'], interactive: ['node']})
  }

  setData(data: LayerTree['data']) {
    this._data = createData('relation', this.data, data)

    if (!this.data) return

    const dfs = (node: Node & {order?: number}) => {
      if (node.children?.length === 0) {
        node.order = ++this.maxOrder
      } else {
        node.children?.forEach((child) => dfs(child))
      }
    }

    this.maxOrder = -1
    this.groups = this.data.nodeGroups
    this.groups[0].forEach(dfs)
    this.createScale()
  }

  setScale(scale: LayerTreeScale) {
    this._scale = createScale(undefined, this.scale, scale)
  }

  setStyle(style: LayerStyle<LayerTreeStyle>) {
    this._style = createStyle(this.options, defaultStyle, this.style, style)
    this.createScale()
  }

  update() {
    this.nodeData = []

    if (!this.data || !this.scale) {
      throw new Error('Invalid data or scale')
    }

    const {layout} = this.options,
      {edges} = this.data,
      {scaleX, scaleY} = this.scale,
      {labelOffset, nodeSize, curveType} = this.style,
      {direction, labelPosition, align, text, node} = this.style

    this.nodeData = this.groups.map((groupedNodes) => {
      const colorMatrix = createColorMatrix({
        layer: this,
        row: groupedNodes.length,
        column: 1,
        theme: node.fill,
      })

      return groupedNodes.map((item, j) => ({
        r: nodeSize / 2,
        x:
          layout.left +
          (direction === 'horizontal'
            ? (scaleX(item.level ?? -1) ?? 0)
            : (scaleX(item.order ?? -1) ?? 0)),
        y:
          layout.top +
          (direction === 'horizontal'
            ? (scaleY(item.order ?? -1) ?? 0)
            : (scaleY(item.level ?? -1) ?? 0)),
        color: colorMatrix.get(j, 0),
        parents: item.parents ?? [],
        meta: {[item.name]: item.value},
        ...item,
      }))
    })

    const nodeMap = new Map(
      this.nodeData.flatMap((values) => values.map((node) => [node.id, node]))
    )

    // parent position is determined by the child position
    this.nodeData.reverse().forEach((groupedNodes) =>
      groupedNodes.forEach(({parents, ...rest}) => {
        const target = direction === 'horizontal' ? 'y' : 'x',
          value = rest[target]

        parents.forEach((parent) => {
          if (!parent[target]) parent[target] = value

          parent.min = Math.min(value, parent.min || value)
          parent.max = Math.max(value, parent.max || value)

          if (align === 'start') {
            parent[target] = parent.min
          } else if (align === 'center') {
            parent[target] = (parent.min + parent.max) / 2
          } else if (align === 'end') {
            parent[target] = parent.max
          }

          if (nodeMap.has(parent.id)) {
            nodeMap.get(parent.id)![target] = parent[target]!
          }
        })
      })
    )

    this.edgeData = [
      edges.map(({from, to}) => ({
        curve: curveType,
        color: nodeMap.get(from)?.color ?? 'white',
        x1: nodeMap.get(from)?.x ?? 0,
        y1: nodeMap.get(from)?.y ?? 0,
        x2: nodeMap.get(to)?.x ?? 0,
        y2: nodeMap.get(to)?.y ?? 0,
      })),
    ]

    // step curve mode needs to be optimized display
    if (curveType.match(/step/i) && this.edgeData.length) {
      this.edgeData = Array.from(
        new Set(this.edgeData[0].map(({x1, y1}) => `${x1}-${y1}`))
      )
        .map((key) =>
          this.edgeData[0].filter(({x1, y1}) => `${x1}-${y1}` === key)
        )
        .map((group) => {
          const {x1, x2, y1, y2} = group[0],
            medianX = direction === 'vertical' ? x1 : (x1 + x2) / 2,
            medianY = direction === 'horizontal' ? y1 : (y1 + y2) / 2,
            masterLine = {...group[0], x2: medianX, y2: medianY},
            slaveLines = group.map(({...other}) => ({
              ...other,
              x1: medianX,
              y1: medianY,
            }))

          return [masterLine, ...slaveLines]
        })
    }

    this.textData = this.nodeData.map((group, i) => {
      const isBoundary =
        (labelPosition === 'outer' && i === 0) ||
        (labelPosition === 'inner' && i === this.nodeData.length - 1)

      if (direction === 'horizontal') {
        return group.map(({x, y, r, name}) =>
          createText({
            x: isBoundary ? x + r + labelOffset : x - r - labelOffset,
            y: y,
            position: isBoundary ? 'right' : 'left',
            style: text,
            value: name,
          })
        )
      } else {
        return group.map(({x, y, r, name}) =>
          createText({
            x: x,
            y: isBoundary ? y + r + labelOffset : y - r - labelOffset,
            position: isBoundary ? 'bottom' : 'top',
            style: text,
            value: name,
          })
        )
      }
    })
  }

  private createScale() {
    if (!this.data) return

    const {nodes} = this.data,
      {width, height} = this.options.layout,
      {nodeSize, direction} = this.style,
      levels = robustRange(0, max(nodes.map(({level}) => level ?? 0)) ?? 0)

    if (direction === 'horizontal') {
      this._scale = createScale(
        {
          scaleX: scalePoint<number>()
            .domain(levels)
            .range([nodeSize / 2, width - nodeSize / 2]),
          scaleY: scalePoint<number>()
            .domain(robustRange(0, this.maxOrder))
            .range([nodeSize / 2, height - nodeSize / 2]),
        },
        this.scale
      )
    } else if (direction === 'vertical') {
      this._scale = createScale(
        {
          scaleX: scalePoint<number>()
            .domain(robustRange(0, this.maxOrder))
            .range([nodeSize / 2, width - nodeSize / 2]),
          scaleY: scalePoint<number>()
            .domain(levels)
            .range([nodeSize / 2, height - nodeSize / 2]),
        },
        this.scale
      )
    }
  }

  draw() {
    const nodeData = this.nodeData.map((group) => ({
      data: group.map(({x, y, r, meta}) => ({x, y, r, meta})),
      fill: group.map(({color}) => color),
      ...this.style.node,
    }))
    const edgeData = this.edgeData.map((group) => ({
      data: group.map(({x1, x2, y1, y2}) => ({
        curve: this.style.curveType,
        points: [
          {x: x1, y: y1},
          {x: x2, y: y2},
        ],
      })),
      ...this.style.edge,
      stroke: group.map(({color}) => color),
    }))
    const textData = this.textData.map((group) => ({
      data: group,
      ...this.style.text,
    }))

    this.drawBasic({type: 'curve', key: 'edge', data: edgeData})
    this.drawBasic({type: 'circle', key: 'node', data: nodeData})
    this.drawBasic({type: 'text', key: 'text', data: textData})
  }
}
