import {max, range, sum} from 'd3'
import {LayerBase} from '../base'
import {DataRelation} from '../../data'
import {scaleLinear} from '../../scales'
import {createColorMatrix, createStyle, createText, validateAndCreateData} from '../helpers'
import {getAttr, noChange} from '../../utils'
import {
  ChartContext,
  DrawerData,
  LayerSankeyStyle,
  LayerSankeyOptions,
  TextDrawerProps,
  Node,
  RectDrawerProps,
} from '../../types'

const defaultStyle: LayerSankeyStyle = {
  edgeVariant: 'curve',
  direction: 'horizontal',
  nodeWidth: 10,
  nodeGap: 10,
  edgeGap: 2,
  labelOffset: 5,
  align: 'start',
  edge: {
    fillOpacity: 0.7,
    strokeOpacity: 0.7,
  },
  text: {
    fontSize: 12,
  },
}

export class LayerSankey extends LayerBase<LayerSankeyOptions> {
  private _data: Maybe<DataRelation>

  private _style = defaultStyle

  private textData: DrawerData<TextDrawerProps>[][] = []

  private nodeData: (DrawerData<RectDrawerProps> & {
    stackedEdgeLength: [0, 0]
    color: string
  } & Node)[][] = []

  private edgeData: (Record<'x1' | 'y1' | 'x2' | 'y2' | 'x3' | 'y3' | 'x4' | 'y4', number> & {
    color: string
    length: number
  })[] = []

  get data() {
    return this._data
  }

  get style() {
    return this._style
  }

  constructor(options: LayerSankeyOptions, context: ChartContext) {
    super({options, context, sublayers: ['node', 'edge', 'text'], tooltipTargets: ['node']})
  }

  setData(data: LayerSankey['data']) {
    this._data = validateAndCreateData('relation', this.data, data)
  }

  setScale() {}

  setStyle(style: LayerSankeyStyle) {
    this._style = createStyle(defaultStyle, this._style, style)
  }

  update() {
    if (!this.data) {
      throw new Error('Invalid data')
    }

    const {edges, nodes} = this.data,
      {layout, createGradient} = this.options,
      {align, text, node, direction} = this.style,
      {labelOffset = 5, nodeWidth = 5, nodeGap = 0, edgeGap = 0} = this.style,
      levels = range(0, (max(nodes.map(({level}) => level ?? 0)) ?? 0) + 1),
      groups = levels.map((value) => nodes.filter(({level}) => level === value)),
      // calculate the theoretical maximum value including the gap
      maxNumber = max(
        levels.map((level, i) => {
          const totalNumber = sum(groups[level].map(({value}) => value)),
            gapLength = (groups[level].length - 1) * getAttr(nodeGap, i, 5),
            totalLength = direction === 'horizontal' ? layout.height : layout.width,
            ratio = totalNumber / (totalLength - gapLength)
          return totalNumber + gapLength * ratio
        })
      ),
      scaleNode = scaleLinear({
        domain: [0, maxNumber ?? 0],
        range: direction === 'horizontal' ? [0, layout.width] : [0, layout.height],
      }),
      totalLength = direction === 'horizontal' ? layout.width : layout.height,
      groupNodeWidths = range(0, groups.length).map((i) => getAttr(nodeWidth, i, 5)),
      groupNodeGap = (totalLength - sum(groupNodeWidths)) / (groups.length - 1)

    this.nodeData = groups.map((groupedNodes, i) => {
      const colorMatrix = createColorMatrix({
        layer: this,
        row: groupedNodes.length,
        column: 1,
        theme: node?.fill,
      })

      return groupedNodes.map((item, j) => ({
        y: layout.top,
        x: layout.left + groupNodeGap * i + sum(groupNodeWidths.slice(0, i)),
        width: groupNodeWidths[i],
        height: scaleNode(item.value ?? 0),
        color: colorMatrix.get(j, 0),
        stackedEdgeLength: [0, 0],
        ...item,
      }))
    })

    this.nodeData.forEach((group, i) => {
      group.forEach((item, j) => {
        j && (item.y = group[j - 1].y + group[j - 1].height + getAttr(nodeGap, i, 5))
      })
    })

    // move rect node according align value
    this.nodeData.forEach((group) => {
      const tailNode = group[group.length - 1]

      if (direction === 'horizontal') {
        const offset = layout.top + layout.height - tailNode.y - tailNode.height,
          moveY = align === 'end' ? offset : align === 'middle' ? offset / 2 : 0

        group.forEach((item) => (item.y += moveY))
      }

      if (direction === 'vertical') {
        const offset = layout.top + layout.width - tailNode.y - tailNode.height,
          moveX = align === 'end' ? offset : align === 'middle' ? offset / 2 : 0

        group.forEach((item) => (item.y += moveX))
      }
    })

    const flatNodes = this.nodeData.flatMap(noChange)
    this.edgeData = edges.map(({from, to, value}) => {
      const length = scaleNode(value ?? NaN),
        fromNode = flatNodes.find(({id}) => id === from)!,
        toNode = flatNodes.find(({id}) => id === to)!

      fromNode.stackedEdgeLength[1] += length
      toNode.stackedEdgeLength[0] += length

      return {
        length,
        x1: fromNode.x + fromNode.width + edgeGap,
        y1: fromNode.y + fromNode.stackedEdgeLength[1] - length,
        x4: fromNode.x + fromNode.width + edgeGap,
        y4: fromNode.y + fromNode.stackedEdgeLength[1],
        x2: toNode.x - edgeGap,
        y2: toNode.y + toNode.stackedEdgeLength[0] - length,
        x3: toNode.x - edgeGap,
        y3: toNode.y + toNode.stackedEdgeLength[0],
        color: createGradient({
          type: 'linear',
          direction: direction ?? 'horizontal',
          colors: [fromNode.color, toNode.color],
        }) as string,
      }
    })

    if (direction === 'vertical') {
      this.nodeData = this.nodeData.map((group) =>
        group.map(({x, y, height, width, ...other}) => ({
          width: height,
          height: width,
          x: y - layout.top + layout.left,
          y: x - layout.left + layout.top,
          ...other,
        }))
      )
      this.edgeData = this.edgeData.map(({x1, y1, x2, y2, x3, y3, x4, y4, ...rest}) => ({
        ...rest,
        x1: y1 - layout.top + layout.left,
        y1: x1 - layout.left + layout.top,
        x2: y2 - layout.top + layout.left,
        y2: x2 - layout.left + layout.top,
        x3: y3 - layout.top + layout.left,
        y3: x3 - layout.left + layout.top,
        x4: y4 - layout.top + layout.left,
        y4: x4 - layout.left + layout.top,
      }))
    }

    this.textData = this.nodeData.map((group, i) => {
      const isLast = i === this.nodeData.length - 1

      if (direction === 'horizontal') {
        return group.map(({x, y, width, height, name, value}) =>
          createText({
            x: isLast ? x - labelOffset : x + width + labelOffset,
            y: y + height / 2,
            value: `${name}(${value})`,
            position: isLast ? 'left' : 'right',
            style: text,
          })
        )
      } else {
        return group.map(({x, y, width, height, name, value}) =>
          createText({
            x: x + width / 2,
            y: isLast ? y - labelOffset : y + height + labelOffset,
            value: `${name}(${value})`,
            position: isLast ? 'top' : 'bottom',
            style: text,
          })
        )
      }
    })
  }

  private getPath = (data: Omit<ArrayItem<LayerSankey['edgeData']>, 'color' | 'length'>) => {
    const {x1, y1, x2, y2, x3, y3, x4, y4} = data,
      {edgeVariant, direction} = this.style

    if (edgeVariant === 'ribbon') {
      if (direction === 'horizontal') {
        return [
          `M ${x1},${y1}`,
          `C ${(x1 + x2) / 2},${y1} ${(x1 + x2) / 2},${y2} ${x2},${y2}`,
          `L ${x3},${y3}`,
          `C ${(x3 + x4) / 2},${y3} ${(x3 + x4) / 2},${y4} ${x4},${y4} Z`,
        ].join(' ')
      } else if (direction === 'vertical') {
        return [
          `M ${x1},${y1}`,
          `C ${x1},${(y1 + y2) / 2} ${x2},${(y1 + y2) / 2} ${x2},${y2}`,
          `L ${x3},${y3}`,
          `C ${x3},${(y3 + y4) / 2} ${x4},${(y3 + y4) / 2} ${x4},${y4} Z`,
        ].join(' ')
      }
    } else {
      if (direction === 'horizontal') {
        return [
          `M ${x1},${(y1 + y4) / 2}`,
          `C ${(x1 + x2) / 2},${(y1 + y4) / 2} ${(x1 + x2) / 2},${(y2 + y3) / 2} ${x2},${
            (y2 + y3) / 2
          }`,
        ].join(' ')
      } else if (direction === 'vertical') {
        return [
          `M ${(x1 + x4) / 2},${y1}`,
          `C ${(x1 + x4) / 2},${(y1 + y2) / 2} ${(x2 + x3) / 2},${(y1 + y2) / 2} ${
            (x2 + x3) / 2
          },${y2}`,
        ].join(' ')
      }
    }
  }

  draw() {
    const {edgeVariant, edge} = this.style
    const nodeData = this.nodeData.map((group) => ({
      data: group.map(({width, height, x, y}) => ({x, y, width, height})),
      source: group.map(({value, name}) => ({category: name, value})),
      transformOrigin: 'center',
      ...this.style.node,
      fill: group.map(({color}) => color ?? 'black'),
    }))
    const edgeData = this.edgeData.map(({color, length, ...rest}) => ({
      data: [{path: this.getPath(rest)}],
      ...this.style.edge,
      fill: edgeVariant === 'ribbon' ? color : '#00000000',
      stroke: edgeVariant === 'curve' ? color : edge?.stroke,
      strokeWidth: edgeVariant === 'curve' ? length : edge?.strokeWidth,
    }))
    const textData = this.textData.map((group) => ({
      data: group,
      ...this.style.text,
    }))

    this.drawBasic({type: 'rect', data: nodeData, sublayer: 'node'})
    this.drawBasic({type: 'path', data: edgeData, sublayer: 'edge'})
    this.drawBasic({type: 'text', data: textData})
  }
}
