import {fabric} from 'fabric'
import {Canvas} from 'fabric/fabric-impl'
import {select, schemeCategory10} from 'd3'
import {defaultLayoutCreator} from '../layout'
import {LayerAxis, layerMapping} from '../layers'
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
  LayoutCreator,
  ChartProps,
  LayerSchema,
  ChartContext,
  GradientCreatorProps,
  LayerOptions,
  LayerScalesShape,
  D3Selection,
  LayerType,
  LayerAxisScaleShape,
} from '../types'

fabric.Object.prototype.objectCaching = false

export class Chart {
  public state: ChartState = 'initialize'

  private _layout: LayoutShape

  private _layers: Layer[] = []

  private padding: Padding

  private container: HTMLElement

  private defs: GradientCreatorProps<unknown>['container']

  private tooltip: Tooltip

  private event = createEvent(Chart.name)

  readonly log = createLog(Chart.name)

  readonly engine: Engine

  readonly root: (D3Selection | Canvas) & {
    defs?: AnyObject
  }

  readonly theme: string[]

  readonly containerWidth: number

  readonly containerHeight: number

  get layout() {
    return this._layout
  }

  get layers() {
    return this._layers.filter(({options}) => !options.sublayer)
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

    this._layout = layoutCreator({
      containerWidth: this.containerWidth,
      containerHeight: this.containerHeight,
      padding: this.padding,
    })
    this.tooltip = new Tooltip({
      ...tooltipOptions,
      container: tooltipOptions?.container ?? this.container,
    })
    this.state = 'initialize'
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

  createLayer(options: LayerOptions, sublayer: false = false) {
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
      createSublayer: (options: LayerOptions) => this.createLayer(options, true as false),
      event: this.event,
    }

    if (this.layers.find((layer) => layer.options.id === options.id)) {
      this.log.error(`Duplicate layer id "${options.id}"`)
    }

    const layer = new layerMapping[options.type]({...options, sublayer} as any, context)
    this._layers.push(layer)
    this.state = 'ready'
    this.event.fire(this.state)
    return layer
  }

  getLayerById(id: string) {
    return this.layers.find(({options}) => options.id === id)
  }

  getLayersByType(type: LayerType) {
    return this.layers.filter(({options}) => options.type === type)
  }

  updateLayer(id: string, {data, scale, style, animation}: LayerSchema) {
    const layer = this.getLayerById(id)

    if (layer) {
      !isNil(data) && layer.setData(data)
      !isNil(scale) && layer.setScale(scale)
      !isNil(style) && layer.setStyle(style)
      !isNil(animation) && layer.setAnimation(animation)
      layer.draw()
    }
  }

  setVisible(id: string, visible: boolean) {
    this.getLayerById(id)?.setVisible(visible)
  }

  bindCoordinate(props: {trigger?: Layer; redraw?: boolean}) {
    const {trigger, redraw} = props,
      axisLayer = this.layers.find((layer) => isLayerAxis(layer)) as Maybe<LayerAxis>,
      interactiveLayer = this.layers.find((layer) => isLayerInteractive(layer)),
      disabledLayers: LayerType[] = ['interactive', 'axis', 'legend', 'auxiliary'],
      layers = this.layers.filter(({options}) => !disabledLayers.includes(options.type)),
      coordinate = axisLayer?.options.coordinate

    axisLayer?.clearScale()
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

      axisLayer?.setScale(mergedScales as LayerAxisScaleShape)
    })

    axisLayer?.niceScale()
    interactiveLayer?.setScale(axisLayer?.scale)

    layers.forEach((layer) => {
      if (layer.options.id === trigger?.options.id) {
        return
      }

      const scales = {...layer.scale, ...axisLayer?.scale},
        {axis, layout} = layer.options

      if (coordinate === 'geographic') {
        layer.setScale({
          ...scales,
          scaleX: (x: number) => (scales.scaleX?.(x) as number) - layout.left,
          scaleY: (y: number) => (scales.scaleY?.(y) as number) - layout.top,
        } as LayerScalesShape)
      } else {
        layer.setScale({
          ...scales,
          scaleY: axis === 'minor' ? scales.scaleYR : scales.scaleY,
        })
      }
      redraw && layer.draw()
    })
  }

  draw() {
    this.layers.forEach((layer) => layer.draw())
  }

  destroy() {
    this.layers.forEach((layer) => layer.destroy())
    this._layers.length = 0
    this.state = 'destroy'
    this.tooltip.destroy()
    this.event.fire(this.state)
  }
}
