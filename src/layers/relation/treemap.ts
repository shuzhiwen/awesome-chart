import {hierarchy, treemap} from 'd3'
import * as d3 from 'd3-hierarchy'
import {LayerBase} from '../base'
import {DataRelation} from '../../data'
import {getAttr, overflowControl, uuid} from '../../utils'
import {createColorMatrix, createStyle, createText, validateAndCreateData} from '../helpers'
import {
  ChartContext,
  DrawerData,
  LayerTreemapStyle,
  LayerTreemapOptions,
  TextDrawerProps,
  Node,
  RectDrawerProps,
} from '../../types'

const defaultStyle: LayerTreemapStyle = {
  align: 'middle',
  verticalAlign: 'middle',
  labelGap: 5,
}

export class LayerTreemap extends LayerBase<LayerTreemapOptions> {
  private _data: Maybe<DataRelation>

  private _style = defaultStyle

  private textData: DrawerData<TextDrawerProps>[][] = []

  private rectData: (DrawerData<RectDrawerProps> & {
    data: Node
    color: string
  })[] = []

  get data() {
    return this._data
  }

  get style() {
    return this._style
  }

  constructor(options: LayerTreemapOptions, context: ChartContext) {
    super({options, context, sublayers: ['rect', 'text'], tooltipTargets: ['rect']})
  }

  setData(data: LayerTreemap['data']) {
    this._data = validateAndCreateData('relation', this.data, data)
  }

  setScale() {}

  setStyle(style: LayerTreemapStyle) {
    this._style = createStyle(defaultStyle, this._style, style)
  }

  update() {
    if (!this.data) {
      throw new Error('Invalid data')
    }

    const {nodes} = this.data,
      {layout} = this.options,
      {left, top, width, height} = layout,
      {title = 'treemapSquarify', rect, align, verticalAlign, labelGap = 0, text} = this.style,
      root = {id: uuid(), name: 'root', value: 0, children: nodes.filter(({level}) => level === 0)},
      hierarchyNode = hierarchy(root)
        .sum((d) => d.value)
        .sort((a, b) => b.data.value - a.data.value),
      leaves = treemap<Node>()
        .tile(d3[title])
        .size([width, height])
        .round(true)
        .paddingInner(1)(hierarchyNode)
        .leaves(),
      colorMatrix = createColorMatrix({
        layer: this,
        row: leaves.length,
        column: 1,
        theme: rect?.fill,
      })

    this.rectData = leaves.map(({x0, x1, y0, y1, data}, i) => ({
      data,
      x: x0 + left,
      y: y0 + top,
      width: x1 - x0,
      height: y1 - y0,
      color: colorMatrix.get(i, 0),
    }))

    this.textData = this.rectData.map(({x, y, width, height, data: {name, value}}, i) => {
      let [nameX, nameY, position]: [number, number, Position9] = [0, 0, 'center']
      const fontSize = getAttr(text?.fontSize, i, 12)

      if (align === 'start' && verticalAlign === 'start') {
        ;[nameX, nameY, position] = [x, y, 'rightBottom']
      } else if (align === 'middle' && verticalAlign === 'start') {
        ;[nameX, nameY, position] = [x + width / 2, y, 'bottom']
      } else if (align === 'end' && verticalAlign === 'start') {
        ;[nameX, nameY, position] = [x + width, y, 'leftBottom']
      } else if (align === 'start' && verticalAlign === 'middle') {
        ;[nameX, nameY, position] = [x, y + height / 2 - labelGap / 2, 'rightTop']
      } else if (align === 'middle' && verticalAlign === 'middle') {
        ;[nameX, nameY, position] = [x + width / 2, y + height / 2 - labelGap / 2, 'top']
      } else if (align === 'end' && verticalAlign === 'middle') {
        ;[nameX, nameY, position] = [x + width, y + height / 2 - labelGap / 2, 'leftTop']
      } else if (align === 'start' && verticalAlign === 'end') {
        ;[nameX, nameY, position] = [x, y + height - fontSize - labelGap, 'rightTop']
      } else if (align === 'middle' && verticalAlign === 'end') {
        ;[nameX, nameY, position] = [x + width / 2, y + height - fontSize - labelGap, 'top']
      } else if (align === 'end' && verticalAlign === 'end') {
        ;[nameX, nameY, position] = [x + width, y + height - fontSize - labelGap, 'leftTop']
      }

      const nameText = overflowControl(name, {width, height: (height - labelGap) / 2})
      const valueText = overflowControl(value, {width, height: (height - labelGap) / 2})

      return [
        createText({value: nameText, x: nameX, y: nameY, position, style: text}),
        createText({
          value: valueText,
          x: nameX,
          y: nameY + fontSize + labelGap,
          position,
          style: text,
        }),
      ]
    })
  }

  draw() {
    const rectData = this.rectData.map(({width, height, x, y, data, color}) => ({
      data: [{width, height, x, y}],
      source: [{category: data.name, value: data.value}],
      ...this.style.rect,
      fill: color,
    }))
    const textData = this.textData.map((group) => ({
      data: group,
      ...this.style.text,
    }))
    this.drawBasic({type: 'rect', data: rectData})
    this.drawBasic({type: 'text', data: textData})
  }
}
