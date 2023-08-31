import {chord, group, ribbon} from 'd3'
import {DataTable} from '../../data'
import {
  ArcDrawerProps,
  DrawerData,
  LayerChordStyle,
  LayerOptions,
  LayerStyle,
  PathDrawerProps,
  SourceMeta,
} from '../../types'
import {LayerBase} from '../base'
import {
  createColorMatrix,
  createData,
  createRotatedArcText,
  createStyle,
} from '../helpers'

type Key = 'node' | 'edge' | 'text'

const defaultStyle: LayerChordStyle = {
  arcWidth: 10,
  labelOffset: 10,
  edge: {
    opacity: 0.7,
  },
  node: {},
  text: {},
}

export class LayerChord extends LayerBase<Key> {
  private _data: Maybe<DataTable>

  private _style = defaultStyle

  private textData: ReturnType<typeof createRotatedArcText>[] = []

  private nodeData: (DrawerData<ArcDrawerProps> & {
    meta: Pick<SourceMeta, 'category' | 'value'>
    color: string
    index: number
  })[] = []

  private edgeData: (DrawerData<PathDrawerProps> & {
    color: string
    index: number
  })[][] = []

  get data() {
    return this._data
  }

  get style() {
    return this._style
  }

  constructor(options: LayerOptions) {
    super({
      options,
      sublayers: ['node', 'edge', 'text'],
      interactive: ['node'],
    })
  }

  setData(data: LayerChord['data']) {
    this._data = createData('table', this.data, data)
  }

  setStyle(style: LayerStyle<LayerChordStyle>) {
    this._style = createStyle(this.options, defaultStyle, this.style, style)
  }

  update() {
    if (!this.data) {
      throw new Error('Invalid data')
    }

    const {rows, body} = this.data,
      {left, top, width, height} = this.options.layout,
      {arcWidth, labelOffset, text, node} = this.style,
      [centerX, centerY] = [left + width / 2, top + height / 2],
      chordData = chord().padAngle(Math.PI / 10 / rows.length)(
        body as number[][]
      ),
      groupData = Array.from(
        group(chordData, (data) => data.target.index).values()
      ),
      maxRadius = Math.min(width, height) / 2,
      radius = maxRadius - arcWidth,
      colorMatrix = createColorMatrix({
        layer: this,
        row: 1,
        column: chordData.groups.length,
        theme: node.fill,
      })

    this.nodeData = chordData.groups.map(({value, ...rest}, i) => ({
      meta: {category: rows[i], value},
      color: colorMatrix.get(0, i),
      innerRadius: radius,
      outerRadius: maxRadius,
      centerX,
      centerY,
      ...rest,
    }))

    this.edgeData = groupData.map((groupData) =>
      groupData.map(({source, target}) => ({
        centerX,
        centerY,
        index: target.index,
        path: ribbon()({
          source: {...source, radius},
          target: {...target, radius},
        }) as unknown as string,
        color: colorMatrix.get(
          0,
          this.nodeData.findIndex(({index}) => index === target.index)
        ),
      }))
    )

    this.textData = this.nodeData.map((item) => {
      const value = item.meta.category,
        angle = (item.startAngle + item.endAngle) / 2,
        radius = item.outerRadius + labelOffset,
        x = Math.sin(angle) * radius + centerX,
        y = centerY - Math.cos(angle) * radius

      return createRotatedArcText({x, y, value, style: text, angle, radius})
    })
  }

  draw() {
    const nodeData = {
      data: this.nodeData,
      ...this.style.node,
      fill: this.nodeData.map(({color}) => color),
    }
    const edgeData = this.edgeData.map((group) => ({
      data: group,
      ...this.style.edge,
      fill: group.map(({color}) => color),
    }))
    const textData = {
      data: this.textData,
      rotation: this.textData.map(({rotation}) => rotation),
      ...this.style.text,
    }

    this.drawBasic({type: 'arc', key: 'node', data: [nodeData]})
    this.drawBasic({type: 'path', key: 'edge', data: edgeData})
    this.drawBasic({type: 'text', key: 'text', data: [textData]})
  }
}
