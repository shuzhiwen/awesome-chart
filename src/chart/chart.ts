import * as d3 from 'd3'
import {fabric} from 'fabric'
import {createLog, createEvent} from '../utils'
import {createDefs, getEasyGradientCreator} from '../utils/defines'
import {getStandardLayoutCreator} from '../layout'
import {layerMapping} from '../layers'
import {Tooltip} from '.'
import {
  Layer,
  LayoutShape,
  ChartState,
  DrawerTarget,
  LayoutCreator,
  ChartProps,
  LayerType,
  LayerShape,
  D3Selection,
  BrushProps,
  ChartContext,
  GradientCreatorProps,
} from '../types'

export class Chart {
  static defaultLayoutCreator = getStandardLayoutCreator({brush: false})

  private log = createLog('chart:chart', 'Chart')

  private event = createEvent('chart:chart')

  private _state: ChartState = 'initialize'

  private _layout: LayoutShape

  private _layers: Layer[] = []

  private padding: Padding

  private container: HTMLElement

  private defs: GradientCreatorProps<unknown>['container']

  private tooltip: Tooltip

  readonly engine: Engine

  readonly root: DrawerTarget & {
    defs?: AnyObject
  }

  readonly theme: string[]

  readonly containerWidth: number

  readonly containerHeight: number

  get state() {
    return this._state
  }

  get layout() {
    return this._layout
  }

  get layers() {
    return this._layers
  }

  constructor({
    container,
    width = 100,
    height = 100,
    adjust = true,
    engine = 'svg',
    padding = [0, 0, 0, 0],
    theme = [...d3.schemeCategory10],
    layoutCreator = Chart.defaultLayoutCreator,
    defineSchema = {},
    tooltipOptions,
  }: ChartProps) {
    // initialize state
    this.theme = theme
    this.engine = engine
    this.padding = padding
    this.container = container
    const d3Container = d3.select(this.container)
    d3Container.html('')

    if (adjust) {
      this.containerWidth = +(d3Container.style('width').match(/^\d*/)?.[0] || width)
      this.containerHeight = +(d3Container.style('height').match(/^\d*/)?.[0] || height)
    } else {
      this.containerWidth = width
      this.containerHeight = height
    }

    if (engine === 'canvas') {
      const canvas = d3Container
        .append('canvas')
        .attr('width', this.containerWidth)
        .attr('height', this.containerHeight)
        .style('position', 'absolute')
      this.defs = []
      this.root = new fabric.Canvas(canvas.nodes()[0], {selection: false, hoverCursor: 'pointer'})
      this.root.defs = this.defs
      fabric.Object.prototype.objectCaching = false
    } else {
      this.root = d3Container
        .append('svg')
        .attr('width', this.containerWidth)
        .attr('height', this.containerHeight)
        .attr('xmlns', 'http://www.w3.org/2000/svg')
        .style('position', 'absolute')
      this.defs = this.root.append('defs')
    }

    // initialize other attr
    this._layout = layoutCreator({
      containerWidth: this.containerWidth,
      containerHeight: this.containerHeight,
      padding: this.padding,
    })
    this.tooltip = new Tooltip({
      ...tooltipOptions,
      container: tooltipOptions?.container ?? this.container,
    })

    // custom svg dom
    createDefs({schema: defineSchema || {}, engine, container: this.defs})

    this._state = 'initialize'
    this.event.fire(this.state)
  }

  setPadding({
    padding,
    creator = Chart.defaultLayoutCreator,
  }: {
    padding: Maybe<Padding>
    creator: LayoutCreator
  }) {
    this.padding = padding || this.padding
    this._layout = creator({
      containerWidth: this.containerWidth,
      containerHeight: this.containerHeight,
      padding: this.padding,
    })
  }

  createLayer(type: LayerType, options: LayerShape['options']) {
    const context: ChartContext = {
      root: this.root,
      engine: this.engine,
      tooltip: this.tooltip,
      container: this.container,
      containerWidth: this.containerWidth,
      containerHeight: this.containerHeight,
      createGradient: getEasyGradientCreator({container: this.defs, engine: this.engine}),
      bindCoordinate: this.bindCoordinate.bind(this),
      theme: this.theme,
    }
    // generate a layer by layer type
    const layer = new layerMapping[type](options, context)
    this._layers.push(layer)
    this._state = 'ready'
    this.event.fire(this.state)
    return layer
  }

  getLayer(id: string) {
    const layer = this._layers.find(({options}) => options.id === id)
    !layer && this.log.warn('invalid layerId', id)
    return layer
  }

  updateLayer(id: string, {data, scale, style, animation}: LayerShape) {
    const layer = this.getLayer(id)
    layer && layer.update({data, scale, style, animation})
  }

  setVisible(id: string, visible: boolean) {
    const layer = this.getLayer(id)
    layer && layer.setVisible(visible)
  }

  bindCoordinate(redraw = false, triggerLayer?: Layer) {
    // TODO: fix judgement
    const isAxisLayer = (instance: Layer) => instance ?? false
    const isBaseMapLayer = (instance: Layer) => instance ?? false
    const axisLayer = this._layers.find(({instance}) => isAxisLayer(instance))?.instance
    const type: Coordinate = axisLayer.options?.type
    const layers = this._layers
      .filter(({instance}) => instance.scale && !isAxisLayer(instance))
      .map(({instance}) => instance)

    // merge scales
    layers.forEach((layer) => {
      const {scale, options} = layer
      const {axis} = options
      const scales: Layer['scales'] = {}
      if (type === 'cartesian') {
        scales.scaleX = scale.scaleX
        if (axis === 'minor') {
          scales.scaleYR = scale.scaleY
        } else {
          scales.scaleY = scale.scaleY
        }
      }
      if (type === 'polar') {
        scales.scaleAngle = scale.scaleAngle
        scales.scaleRadius = scale.scaleRadius
      }
      if (type === 'geographic' && isBaseMapLayer(layer)) {
        scales.scaleX = scale.scaleX
        scales.scaleY = scale.scaleY
      }
      axisLayer.setData(null, scales)
      axisLayer.setStyle()
    })

    // axis will merge all scales and give them to every layer
    layers.forEach((layer) => {
      const scales = {...layer.scale, ...axisLayer.scale}
      // projection to normal scale
      if (type === 'geographic') {
        const scaleX = (x: number) => scales.scaleX(x) - layer.options.layout.left
        const scaleY = (y: number) => scales.scaleY(y) - layer.options.layout.top
        layer.setData(null, {...scales, scaleX, scaleY})
      } else {
        const scaleY = layer.options.axis === 'minor' ? scales.scaleYR : scales.scaleY
        layer.setData(null, {...scales, scaleY})
      }
      layer.setStyle()
      redraw && layer !== triggerLayer && layer.draw()
    })
  }

  createBrush({mode, layout, targets}: BrushProps) {
    if (this.engine !== 'svg') {
      this.log.warn('the brush only supports svg')
      return
    }

    const {width, height, left, top} = layout
    const isHorizontal = mode === 'horizontal'
    const layers = this._layers.filter(({id}) => targets.find((item) => item === id))
    const prevRange = new Array(layers.length).fill(null)
    // brush will change range of scale
    const brushed = (event: any) => {
      layers.forEach(({instance}, i) => {
        const {selection} = event
        const total = isHorizontal ? width : height
        const scale = isHorizontal ? instance.scale.scaleX : instance.scale.scaleY
        // initialize
        if (prevRange[i] === null) {
          prevRange[i] = scale.range()
        }
        const zoomFactor = total / (selection[1] - selection[0] || 1)
        const nextRange = [
          prevRange[i][0],
          prevRange[i][0] + (prevRange[i][1] - prevRange[i][0]) * zoomFactor,
        ]
        const offset =
          ((selection[0] - (isHorizontal ? left : top)) / total) * (nextRange[1] - nextRange[0])
        scale.range(nextRange.map((value) => value - offset))
        // mark scale with brush so that layer base can merge scales correctly
        scale.brushed = true
        instance.setData(null, {[isHorizontal ? 'scaleX' : 'scaleY']: scale})
        instance.setStyle()
        instance.draw()
      })
    }
    // create brush instance
    const [brushX1, brushX2, brushY1, brushY2] = [left, left + width, top, top + height]
    const brush = isHorizontal ? d3.brushX() : d3.brushY()
    brush.on('brush', brushed).extent([
      [brushX1, brushY1],
      [brushX2, brushY2],
    ])
    // initialize brush area
    const brushDOM = (this.root as D3Selection).append('g').attr('class', 'chart-brush').call(brush)
    brushDOM.call(brush.move, isHorizontal ? [brushX1, brushX2] : [brushY1, brushY2])
  }

  destroy() {
    while (this._layers.length) {
      this._layers.shift()?.destroy()
    }
    this._state = 'destroy'
    this.event.fire(this.state)
  }
}
