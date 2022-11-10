import {select} from 'd3'
import {fabric} from 'fabric'
import {Canvas} from 'fabric/fabric-impl'
import {defaultLayoutCreator} from '../layout'
import {LayerAxis, LayerLegend, layerMapping} from '../layers'
import {lightTheme} from './theme'
import {Tooltip} from './tooltip'
import {isNil, noop} from 'lodash'
import {
  createLog,
  createEvent,
  createDefs,
  getEasyGradientCreator,
  isLayerBasemap,
  dependantLayers,
  noChange,
  chartLifeCycles,
  isLayerLegend,
  isLayerAxis,
  uuid,
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

  private defs: GradientCreatorProps<unknown>['container']

  private readonly log = createLog(Chart.name)

  readonly event = createEvent<
    'MouseEvent' | 'initialized' | 'error' | Keys<typeof chartLifeCycles>
  >(Chart.name)

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
    this.createLifeCycles()
  }

  private createLifeCycles() {
    chartLifeCycles.forEach((name) => {
      const fn: AnyFunction = this[name] || noop

      this[name] = (...parameters: unknown[]) => {
        try {
          fn.call(this, ...parameters)
          this.event.fire(name, {...parameters})
        } catch (error) {
          this.log.error(`Chart lifeCycle(${name}) call exception`, error)
          this.event.fire('error', {error})
        }
      }
    })
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
      rebuildScale: this.rebuildScale.bind(this),
      createGradient: getEasyGradientCreator({container: this.defs}),
    }

    if (isNil(options.id)) {
      options.id = uuid()
    } else if (this.getLayerById(options.id)) {
      this.log.error(`Duplicate layer id "${options.id}"`)
      return
    } else if (options.type === 'axis' && this.getLayerByType('axis')) {
      this.log.error('A chart can only have one axis layer')
      return
    } else if (options.type === 'legend' && this.getLayerByType('legend')) {
      this.log.error('A chart can only have one legend layer')
      return
    }

    const layer = new layerMapping[options.type](options as never, context)
    this._layers.push(layer)

    return layer
  }

  getLayerById(id: string) {
    return this.layers.find(({options}) => options.id === id)
  }

  getLayerByType(type: LayerType) {
    return this.layers.find(({options}) => options.type === type)
  }

  getLayersByType(type: LayerType) {
    return this.layers.filter(({options}) => options.type === type)
  }

  getDependantLayers() {
    return this.layers.filter(({options: {type}}) => dependantLayers.has(type))
  }

  getIndependentLayers() {
    return this.layers.filter(({options: {type}}) => !dependantLayers.has(type))
  }

  getNonUniqueLayers() {
    return this.layers.filter((layer) => !isLayerLegend(layer) && !isLayerAxis(layer))
  }

  rebuildScale(props: {trigger?: LayerInstance; redraw?: boolean}) {
    const {trigger, redraw} = props,
      axisLayer = this.getLayerByType('axis') as Maybe<LayerAxis>,
      legendLayer = this.getLayerByType('legend') as Maybe<LayerLegend>

    if (!axisLayer) throw new Error('There is no axis layer')

    this.getIndependentLayers()
      .concat(this.getLayersByType('brush'))
      .forEach((layer) => {
        const {scale, options} = layer,
          coordinate = axisLayer.options.coordinate,
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
        {scaleY, scaleYR, ...rest} = {...layer.scale, ...axisLayer.scale},
        finalScaleY = axis === 'minor' ? scaleYR : scaleY

      if (layer.options.id !== trigger?.options.id) {
        if (layer !== axisLayer) layer.setScale({...rest, scaleY: finalScaleY})
        redraw && layer.draw()
      }
    })

    if (!isLayerLegend(trigger)) {
      legendLayer?.bindLayers(this.layers)
      legendLayer?.draw()
    }
  }

  draw() {
    const axisLayer = this.getLayerByType('axis')
    const legendLayer = this.getLayerByType('legend')

    this.getIndependentLayers().forEach((layer) => layer.update())
    axisLayer && this.rebuildScale({redraw: false, trigger: legendLayer})
    this.getNonUniqueLayers().forEach((layer) => layer.draw())

    axisLayer?.draw()
    if (isLayerLegend(legendLayer)) {
      legendLayer.bindLayers(this.layers)
      legendLayer.draw()
    }
  }

  destroy() {
    this.layers.forEach((layer) => layer.destroy())
    this._layers.length = 0
    this.tooltip.destroy()
  }
}
