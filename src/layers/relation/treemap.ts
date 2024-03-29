import {hierarchy, treemap} from 'd3'
import * as d3 from 'd3-hierarchy'
import {DataRelation} from '../../data'
import {
  DrawerData,
  LayerOptions,
  LayerStyle,
  LayerTreemapStyle,
  Node,
  RectDrawerProps,
  TextDrawerProps,
} from '../../types'
import {getAttr, overflowControl, uuid} from '../../utils'
import {LayerBase} from '../base'
import {
  createColorMatrix,
  createData,
  createStyle,
  createText,
} from '../helpers'

type Key = 'rect' | 'text'

const defaultStyle: LayerTreemapStyle = {
  tile: 'treemapSquarify',
  align: ['center', 'center'],
  labelGap: 5,
  rect: {},
  text: {},
}

export class LayerTreemap extends LayerBase<Key> {
  private _data: Maybe<DataRelation>

  private _style = defaultStyle

  protected textData: DrawerData<TextDrawerProps>[][] = []

  protected rectData: (DrawerData<RectDrawerProps> & {
    data: Node
    color: string
    meta: AnyObject
  })[] = []

  get data() {
    return this._data
  }

  get style() {
    return this._style
  }

  constructor(options: LayerOptions) {
    super({options, sublayers: ['rect', 'text'], interactive: ['rect']})
  }

  setData(data: LayerTreemap['data']) {
    this._data = createData('relation', this.data, data)
  }

  setStyle(style: LayerStyle<LayerTreemapStyle>) {
    this._style = createStyle(this.options, defaultStyle, this.style, style)
  }

  update() {
    if (!this.data) {
      throw new Error('Invalid data')
    }

    const {nodes} = this.data,
      {layout} = this.options,
      {left, top, width, height} = layout,
      {tile, rect, labelGap, text} = this.style,
      [align, verticalAlign] = this.style.align ?? ['start', 'start'],
      root = {
        id: uuid(),
        name: 'root',
        value: 0,
        children: nodes.filter(({level}) => level === 0),
      },
      hierarchyNode = hierarchy<Node>(root)
        .sum((d) => d.value!)
        .sort((a, b) => b.data.value! - a.data.value!),
      leaves = treemap<Node>()
        .tile(d3[tile])
        .size([width, height])
        .round(true)
        .paddingInner(1)(hierarchyNode)
        .leaves(),
      colorMatrix = createColorMatrix({
        layer: this,
        row: leaves.length,
        column: 1,
        theme: rect.fill,
      })

    this.rectData = leaves.map(({x0, x1, y0, y1, data}, i) => ({
      data,
      x: x0 + left,
      y: y0 + top,
      width: x1 - x0,
      height: y1 - y0,
      color: colorMatrix.get(i, 0),
      meta: {[data.name]: data.value},
    }))

    this.textData = this.rectData.map(
      ({x, y, width, height, data: {name, value}}, i) => {
        let nameX: number, nameY: number, position: Position9
        const fontSize = getAttr(text.fontSize, i, 12)

        if (align === 'start' && verticalAlign === 'start') {
          ;[nameX, nameY, position] = [x, y, 'rightBottom']
        } else if (align === 'center' && verticalAlign === 'start') {
          ;[nameX, nameY, position] = [x + width / 2, y, 'bottom']
        } else if (align === 'end' && verticalAlign === 'start') {
          ;[nameX, nameY, position] = [x + width, y, 'leftBottom']
        } else if (align === 'start' && verticalAlign === 'center') {
          ;[nameX, nameY, position] = [
            x,
            y + height / 2 - labelGap / 2,
            'rightTop',
          ]
        } else if (align === 'center' && verticalAlign === 'center') {
          ;[nameX, nameY, position] = [
            x + width / 2,
            y + height / 2 - labelGap / 2,
            'top',
          ]
        } else if (align === 'end' && verticalAlign === 'center') {
          ;[nameX, nameY, position] = [
            x + width,
            y + height / 2 - labelGap / 2,
            'leftTop',
          ]
        } else if (align === 'start' && verticalAlign === 'end') {
          ;[nameX, nameY, position] = [
            x,
            y + height - fontSize - labelGap,
            'rightTop',
          ]
        } else if (align === 'center' && verticalAlign === 'end') {
          ;[nameX, nameY, position] = [
            x + width / 2,
            y + height - fontSize - labelGap,
            'top',
          ]
        } else if (align === 'end' && verticalAlign === 'end') {
          ;[nameX, nameY, position] = [
            x + width,
            y + height - fontSize - labelGap,
            'leftTop',
          ]
        } else {
          ;[nameX, nameY, position] = [0, 0, 'center']
        }

        const nameText = overflowControl(name, {
          width,
          height: (height - labelGap) / 2,
        })
        const valueText = overflowControl(value, {
          width,
          height: (height - labelGap) / 2,
        })

        return [
          createText({
            value: nameText,
            x: nameX,
            y: nameY,
            position,
            style: text,
          }),
          createText({
            value: valueText,
            x: nameX,
            y: nameY + fontSize + labelGap,
            position,
            style: text,
          }),
        ]
      }
    )
  }

  draw() {
    const rectData = this.rectData.map(
      ({width, height, x, y, meta, color}) => ({
        data: [{width, height, x, y, meta}],
        ...this.style.rect,
        fill: color,
      })
    )
    const textData = this.textData.map((group) => ({
      data: group,
      ...this.style.text,
    }))
    this.drawBasic({type: 'rect', key: 'rect', data: rectData})
    this.drawBasic({type: 'text', key: 'text', data: textData})
  }
}
