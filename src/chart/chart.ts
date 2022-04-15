import {fabric} from 'fabric'
import {select, schemeCategory10} from 'd3'
import {defaultLayoutCreator} from '../layout'
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
  isLayerInteractive,
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

fabric.Object.prototype.objectCaching = false

export class Chart {
  private _state: ChartState = 'initialize'

  private _layout: LayoutShape = {}

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
    layoutCreator = defaultLayoutCreator,
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
      this.root.on('mouse:move', ({e: event}) => this.event.fire('MouseEvent', {event}))
    } else {
      this.root = d3Container
        .append('svg')
        .attr('width', this.containerWidth)
        .attr('height', this.containerHeight)
        .attr('xmlns', 'http://www.w3.org/2000/svg')
        .style('position', 'absolute')
      this.defs = this.root.append('defs')
      this.root.on('mousemove', (event) => this.event.fire('MouseEvent', {event}))
    }

    createDefs({schema: defineSchema, engine, container: this.defs})

    this.setPadding(padding, layoutCreator)
    this.tooltip = new Tooltip({
      ...tooltipOptions,
      container: tooltipOptions?.container ?? this.container,
    })
    this._state = 'initialize'
    this.event.fire(this.state)
  }

  setPadding(padding?: Padding, creator: LayoutCreator = defaultLayoutCreator) {
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
      createSublayer: this.createLayer.bind(this),
      event: this.event,
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

  bindCoordinate() {
    const axisLayer = this._layers.find((layer) => isLayerAxis(layer)),
      interactiveLayer = this._layers.find((layer) => isLayerInteractive(layer)),
      layers = this._layers.filter((layer) => !isLayerAxis(layer) && !isLayerBaseMap(layer)),
      coordinate = axisLayer?.options.coordinate

    layers.forEach((layer) => {
      const {scale, options} = layer,
        {axis} = options,
        mergedScales: Layer['scale'] = {}

      if (coordinate === 'cartesian') {
        mergedScales.scaleX = scale?.scaleX
        if (axis === 'minor') {
          mergedScales.scaleYR = scale?.scaleY
        } else {
          mergedScales.scaleY = scale?.scaleY
        }
      } else if (coordinate === 'polar') {
        mergedScales.scaleAngle = scale?.scaleAngle
        mergedScales.scaleRadius = scale?.scaleRadius
      } else if (coordinate === 'geographic' && isLayerBaseMap(layer)) {
        mergedScales.scaleX = scale?.scaleX
        mergedScales.scaleY = scale?.scaleY
      }

      axisLayer?.setScale(mergedScales)
    })

    isLayerAxis(axisLayer) && axisLayer.niceScale()
    interactiveLayer?.setScale(axisLayer?.scale)

    layers.forEach((layer) => {
      const scales = {...layer.scale, ...axisLayer?.scale},
        {axis, layout} = layer.options

      if (coordinate === 'geographic') {
        layer.setScale({
          ...scales,
          scaleX: (x: any) => (scales.scaleX?.(x) as number) - layout.left,
          scaleY: (y: any) => (scales.scaleY?.(y) as number) - layout.top,
        } as LayerScalesShape)
      } else {
        layer.setScale({
          ...scales,
          scaleY: axis === 'minor' ? scales.scaleYR : scales.scaleY,
        })
      }
    })
  }

  destroy() {
    while (this._layers.length) {
      this._layers.shift()?.destroy()
    }

    this._state = 'destroy'
    this.tooltip.destroy()
    this.event.fire(this.state)
  }
}
