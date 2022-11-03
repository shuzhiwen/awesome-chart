import {select} from 'd3'
import {fabric} from 'fabric'
import {Canvas} from 'fabric/fabric-impl'
import {defaultLayoutCreator} from '../layout'
import {LayerAxis, layerMapping} from '../layers'
import {lightTheme} from './theme'
import {Tooltip} from './tooltip'
import {isNil} from 'lodash'
import {
  createLog,
  createEvent,
  isLayerAxis,
  createDefs,
  getEasyGradientCreator,
  isLayerBasemap,
  isLayerBrush,
  dependantLayers,
  noChange,
  uuid,
  chartLifeCycles,
} from '../utils'
import {
  LayerInstance,
  Layout,
  LayoutCreator,
  ChartProps,
  ChartContext,
  GradientCreatorProps,
  LayerOptions,
  D3Selection,
  LayerType,
  LayerAxisScale,
  ChartTheme,
} from '../types'

fabric.Object.prototype.objectCaching = false

export class Chart {
  private _layout: Layout

  private _layers: LayerInstance[] = []

  private padding: Padding

  private log = createLog(Chart.name)

  private defs: GradientCreatorProps<unknown>['container']

  readonly event = createEvent<'MouseEvent' | Keys<typeof chartLifeCycles>>(Chart.name)

  readonly engine: Engine

  readonly tooltip: Tooltip

  readonly root: D3Selection | Canvas

  readonly theme: ChartTheme

  readonly container: HTMLElement

  readonly containerWidth: number

  readonly containerHeight: number

  get layout() {
    return this._layout
  }

  get layers() {
    return this._layers.filter(({options}) => !options.sublayerConfig)
  }

  constructor({
    container,
    width = 100,
    height = 100,
    adjust = true,
    engine = 'svg',
    padding = [0, 0, 0, 0],
    theme = lightTheme,
    layoutCreator = defaultLayoutCreator,
    defineSchema = {},
    tooltipOptions,
  }: ChartProps) {
    this.theme = theme
    this.engine = engine
    this.padding = padding
    this.container = container

    const domContainer = select(this.container).html('')

    if (adjust) {
      this.containerWidth = +(domContainer.style('width').match(/^\d*/)?.[0] || width)
      this.containerHeight = +(domContainer.style('height').match(/^\d*/)?.[0] || height)
    } else {
      this.containerWidth = width
      this.containerHeight = height
    }

    if (engine === 'canvas') {
      const canvas = domContainer
        .append('canvas')
        .attr('width', this.containerWidth)
        .attr('height', this.containerHeight)
        .style('position', 'absolute')
      this.defs = []
      this.root = new fabric.Canvas(canvas.node(), {selection: false, hoverCursor: 'pointer'})
      this.root.on('mouse:move', ({e: event}) => this.event.fire('MouseEvent', {event}))
    } else {
      this.root = domContainer
        .append('svg')
        .attr('width', this.containerWidth)
        .attr('height', this.containerHeight)
        .attr('xmlns', 'http://www.w3.org/2000/svg')
        .style('position', 'absolute')
      this.defs = this.root.append('defs')
      this.root.on('mousemove', (event) => this.event.fire('MouseEvent', {event}))
    }

    createDefs({schema: defineSchema, container: this.defs})

    this._layout = layoutCreator({
      containerWidth: this.containerWidth,
      containerHeight: this.containerHeight,
      padding: this.padding,
    })
    this.tooltip = new Tooltip({
      ...tooltipOptions,
      container: tooltipOptions?.container ?? this.container,
      getLayersBackupData: () =>
        this._layers.flatMap(({tooltipTargets, cacheData}) =>
          tooltipTargets.map((sublayer) => cacheData[sublayer].data).flatMap(noChange)
        ),
    })

    this.event.fire('initialized')
  }

  setPadding(padding?: Padding, creator: LayoutCreator = defaultLayoutCreator) {
    this.padding = padding || this.padding
    this._layout = creator({
      containerWidth: this.containerWidth,
      containerHeight: this.containerHeight,
      padding: this.padding,
    })
  }

  createLayer(options: LayerOptions) {
    const context: ChartContext = {
      ...this,
      root: options.sublayerConfig?.root || this.root,
      createSublayer: this.createLayer.bind(this),
      bindCoordinate: this.bindCoordinate.bind(this),
      createGradient: getEasyGradientCreator({container: this.defs}),
    }

    if (isNil(options.id)) {
      options.id = uuid()
    } else if (this.layers.find((layer) => layer.options.id === options.id)) {
      this.log.error(`Duplicate layer id "${options.id}"`)
    }

    const layer = new layerMapping[options.type](options as never, context)
    this._layers.push(layer)

    return layer
  }

  getLayerById(id: string) {
    return this.layers.find(({options}) => options.id === id)
  }

  getLayersByType(type: LayerType) {
    return this.layers.filter(({options}) => options.type === type)
  }

  bindCoordinate(props: {trigger?: LayerInstance; redraw?: boolean}) {
    const {trigger, redraw} = props,
      axisLayer = this.layers.find((layer) => isLayerAxis(layer)) as Maybe<LayerAxis>,
      brushLayer = this.layers.find((layer) => isLayerBrush(layer)),
      layers = this.layers.filter(({options: {type}}) => !dependantLayers.has(type)),
      coordinate = axisLayer?.options.coordinate

    if (!axisLayer) throw new Error('There is no axis layer')

    layers.concat(brushLayer ? [brushLayer] : []).forEach((layer) => {
      const {scale, options} = layer,
        {scaleX, scaleY, scaleAngle, scaleRadius, ...rest} = scale ?? {},
        mergedScales: LayerInstance['scale'] = {...rest}

      if (coordinate === 'cartesian') {
        mergedScales.scaleX = scaleX
        if (options.axis === 'minor') {
          mergedScales.scaleYR = scaleY
        } else {
          mergedScales.scaleY = scaleY
        }
      } else if (coordinate === 'polar') {
        mergedScales.scaleAngle = scaleAngle
        mergedScales.scaleRadius = scaleRadius
      } else if (coordinate === 'geographic' && isLayerBasemap(layer)) {
        mergedScales.scaleX = scaleX
        mergedScales.scaleY = scaleY
      }

      axisLayer.setScale(mergedScales as LayerAxisScale)
    })

    axisLayer.niceScale()

    this.layers.forEach((layer) => {
      const {axis} = layer.options,
        {scaleY, scaleYR, ...rest} = {...layer.scale, ...axisLayer.scale}

      if (layer.options.id !== trigger?.options.id) {
        if (layer !== axisLayer)
          layer.setScale({...rest, scaleY: axis === 'minor' ? scaleYR : scaleY})
        redraw && layer.draw()
      }
    })
  }

  draw() {
    this.layers.forEach((layer) => layer.draw())
    this.event.fire('draw')
  }

  destroy() {
    this.layers.forEach((layer) => layer.destroy())
    this._layers.length = 0
    this.tooltip.destroy()
    this.event.fire('destroy')
  }
}
