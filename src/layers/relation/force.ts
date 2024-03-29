import {forceCollide, forceSimulation, forceX, forceY, Simulation} from 'd3'
import {merge} from 'lodash'
import {EVENT_KEY} from '../../core'
import {DataTableList} from '../../data'
import {scaleLinear} from '../../scales'
import {
  CircleDrawerProps,
  DrawerData,
  LayerForceStyle,
  LayerOptions,
  LayerStyle,
  TextDrawerProps,
} from '../../types'
import {LayerBase} from '../base'
import {
  createColorMatrix,
  createData,
  createStyle,
  createText,
} from '../helpers'

type Key = 'node' | 'text'

const defaultStyle: LayerForceStyle = {
  nodeSize: [5, 20],
  node: {},
  text: {},
}

export class LayerForce extends LayerBase<Key> {
  private _data: Maybe<DataTableList>

  private _style = defaultStyle

  private simulation: Maybe<
    Simulation<ArrayItem<LayerForce['nodeData']>, undefined>
  >

  protected textData: DrawerData<TextDrawerProps>[] = []

  protected nodeData: (DrawerData<CircleDrawerProps> & {
    meta: AnyObject
    label: Meta
    value: Meta
    color: string
  })[] = []

  get data() {
    return this._data
  }

  get style() {
    return this._style
  }

  constructor(options: LayerOptions) {
    super({options, sublayers: ['node', 'text'], interactive: ['node']})

    this.systemEvent.onWithOff('destroy', EVENT_KEY, () => {
      this.simulation?.on('tick', null).stop()
    })
  }

  setAnimation(options: Parameters<LayerBase<Key>['setAnimation']>[0]) {
    super.setAnimation(
      merge({}, options, {
        node: {update: {duration: 0, delay: 0}},
        text: {update: {duration: 0, delay: 0}},
      })
    )
  }

  setData(data: LayerForce['data']) {
    this._data = createData('tableList', this.data, data)
  }

  setStyle(style: LayerStyle<LayerForceStyle>) {
    this._style = createStyle(this.options, defaultStyle, this.style, style)
  }

  update() {
    if (!this.data) {
      throw new Error('Invalid data')
    }

    const {containerWidth, containerHeight, layout} = this.options,
      {width, height, left, top} = layout,
      {headers, rawTableList} = this.data,
      {node, nodeSize, text} = this.style,
      colorMatrix = createColorMatrix({
        layer: this,
        row: 1,
        column: rawTableList.length,
        theme: node.fill,
      }),
      scaleNodeSize = scaleLinear({
        domain: this.data.select(headers[1]).range(),
        range: nodeSize ?? [0, 0],
      })

    this.nodeData = rawTableList.map(([label, value], i) => ({
      meta: {[label]: value},
      x:
        Math.random() > 0.5
          ? containerWidth + Math.random() * width
          : -Math.random() * width,
      y:
        Math.random() > 0.5
          ? containerHeight + Math.random() * height
          : -Math.random() * height,
      r: scaleNodeSize(value as number),
      color: colorMatrix.get(0, i),
      label,
      value,
    }))

    this.simulation?.stop()
    this.simulation = forceSimulation(this.nodeData)
      .alphaTarget(0.3)
      .velocityDecay(0.6)
      .force('x', forceX(left + width / 2))
      .force('y', forceY(top + height / 2))
      .force(
        'collide',
        forceCollide((d) => d.r + 1)
      )
      .on('tick', () => {
        this.textData = this.nodeData.map((node) =>
          createText({...node, style: text, position: 'center'})
        )
        this.draw()
      })
  }

  draw() {
    const {node, text} = this.style
    const nodeData = this.nodeData.map((item) => ({
      data: [item],
      ...node,
      fill: item.color,
    }))
    const textData = this.textData.map((group) => ({
      data: [group],
      ...text,
    }))

    this.drawBasic({type: 'circle', key: 'node', data: nodeData})
    this.drawBasic({type: 'text', key: 'text', data: textData})
  }
}
