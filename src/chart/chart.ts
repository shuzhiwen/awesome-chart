import {fabric} from 'fabric'
import {select, schemeCategory10} from 'd3'
import {getStandardLayoutCreator} from '../layout'
import {layerMapping} from '../layers'
import {Tooltip} from './tooltip'
import {isNil} from 'lodash'
import {
  createLog,
  createEvent,
  isLayerAxis,
  isLayerBaseMap,
  createDefs,
  getEasyGradientCreator,
} from '../utils'
import {
  Layer,
  LayoutShape,
  ChartState,
  DrawerTarget,
  LayoutCreator,
  ChartProps,
  LayerType,
  LayerSchema,
  ChartContext,
  GradientCreatorProps,
  LayerOptions,
  LayerScalesShape,
} from '../types'

export class Chart {
  static standardLayoutCreator = getStandardLayoutCreator({brush: false})

  private _state: ChartState = 'initialize'

  private _layout: LayoutShape

  private _layers: Layer[] = []

  private padding: Padding

  private container: HTMLElement

  private defs: GradientCreatorProps<unknown>['container']

  private tooltip: Tooltip

  private event = createEvent(Chart.name)

  readonly log = createLog(Chart.name)

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
    theme = [...schemeCategory10],
    layoutCreator = Chart.standardLayoutCreator,
    defineSchema = {},
    tooltipOptions,
  }: ChartProps) {
    this.theme = theme
    this.engine = engine
    this.padding = padding
    this.container = container
    const d3Container = select(this.container)
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
      this.root = new fabric.Canvas(canvas.node(), {selection: false, hoverCursor: 'pointer'})
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

    createDefs({schema: defineSchema || {}, engine, container: this.defs})
    this._layout = layoutCreator({
      containerWidth: this.containerWidth,
      containerHeight: this.containerHeight,
      padding: this.padding,
    })
    this.tooltip = new Tooltip({
      ...tooltipOptions,
      container: tooltipOptions?.container ?? this.container,
    })
    this._state = 'initialize'
    this.event.fire(this.state)
  }

  setPadding({
    padding,
    creator = Chart.standardLayoutCreator,
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

  createLayer(type: LayerType, options: LayerOptions) {
    const context: ChartContext = {
      root: this.root,
      theme: this.theme,
      engine: this.engine,
      tooltip: this.tooltip,
      container: this.container,
      containerWidth: this.containerWidth,
      containerHeight: this.containerHeight,
      bindCoordinate: this.bindCoordinate.bind(this),
      createGradient: getEasyGradientCreator({container: this.defs, engine: this.engine}),
    }

    const layer = new layerMapping[type](options, context)
    this._layers.push(layer)
    this._state = 'ready'
    this.event.fire(this.state)
    return layer
  }

  getLayer(id: string) {
    const layer = this._layers.find(({options}) => options.id === id)
    !layer && this.log.warn('Invalid ID', id)
    return layer
  }

  updateLayer(id: string, {data, scale, style, animation}: LayerSchema) {
    const layer = this.getLayer(id)

    if (layer) {
      !isNil(data) && layer.setData(data)
      !isNil(scale) && layer.setScale(scale)
      !isNil(style) && layer.setStyle(style)
      !isNil(animation) && layer.setAnimation(animation)
      layer.draw()
    }
  }

  setVisible(id: string, visible: boolean) {
    this.getLayer(id)?.setVisible(visible)
  }

  bindCoordinate(redraw = false, triggerLayer?: Layer) {
    const axisLayer = this._layers.find((instance) => isLayerAxis(instance))
    const coordinate = axisLayer?.options.coordinate
    const layers = this._layers
      .filter((instance) => instance.scales && !isLayerBaseMap(instance))
      .map((instance) => instance)

    layers.forEach((layer) => {
      const {scales, options} = layer
      const {axis} = options
      const mergedScales: Layer['scales'] = {}
      if (coordinate === 'cartesian') {
        mergedScales.scaleX = scales?.scaleX
        if (axis === 'minor') {
          mergedScales.scaleYR = scales?.scaleY
        } else {
          mergedScales.scaleY = scales?.scaleY
        }
      }
      if (coordinate === 'polar') {
        mergedScales.scaleAngle = scales?.scaleAngle
        mergedScales.scaleRadius = scales?.scaleRadius
      }
      if (coordinate === 'geographic' && isLayerBaseMap(layer)) {
        mergedScales.scaleX = scales?.scaleX
        mergedScales.scaleY = scales?.scaleY
      }
      axisLayer?.setScale(mergedScales)
      axisLayer?.setStyle()
    })

    layers.forEach((layer) => {
      const scales = {...layer.scales, ...axisLayer?.scales}
      // projection to normal scale
      if (coordinate === 'geographic') {
        const scaleX = (x: any) => (scales.scaleX?.(x) as number) - layer.options.layout.left
        const scaleY = (y: any) => (scales.scaleY?.(y) as number) - layer.options.layout.top
        layer.setScale({...scales, scaleX, scaleY} as LayerScalesShape)
      } else {
        const scaleY = layer.options.axis === 'minor' ? scales.scaleYR : scales.scaleY
        layer.setScale({...scales, scaleY})
      }
      layer.setStyle()
      redraw && layer !== triggerLayer && layer.draw()
    })
  }

  destroy() {
    while (this._layers.length) {
      this._layers.shift()?.destroy()
    }
    this._state = 'destroy'
    this.event.fire(this.state)
  }
}
