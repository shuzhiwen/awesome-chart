import {select} from 'd3'
import {isNil, noop} from 'lodash'
import {Application, Container} from 'pixi.js'
import {LayerDict} from '../layers'
import {defaultLayoutCreator} from '../layout'
import {
  ChartContext,
  ChartProps,
  ChartTheme,
  CreateLayerProps,
  D3Selection,
  GradientCreatorProps,
  LayerAxisScale,
  LayerInstance,
  LayerType,
  Layout,
  RebuildScaleProps,
} from '../types'
import {
  createLog,
  EventManager,
  getEasyGradientCreator,
  getPercentageNumber,
  isLayerAxis,
  isLayerBasemap,
  isLayerLegend,
  noChange,
  uuid,
} from '../utils'
import {chartLifeCycles, dependantLayers} from './constants'
import {lightTheme} from './theme'
import {Tooltip} from './tooltip'

export class Chart {
  private _layout: Layout

  private _layers: LayerInstance[] = []

  /**
   * The paddings of the main drawing area.
   * The four values represent top right bottom left.
   * @remarks
   * The padding cannot be updated dynamically,
   * it can only be specified through the constructor.
   */
  private padding: Padding

  /**
   * Global define target that all presets gradients are in here.
   */
  private defs: GradientCreatorProps<unknown>['container']

  /**
   * Log for internal messages.
   */
  private readonly log = createLog(this.constructor.name)

  /**
   * Manage lifecycle or error events.
   */
  readonly event = new EventManager<
    'globalEvent' | 'initialized' | 'error' | Keys<typeof chartLifeCycles>
  >()

  /**
   * Decide how the graph will be drawn.
   * In any case, svg should be preferred.
   * @defaultValue svg
   */
  readonly engine: Engine

  /**
   * The tooltip instance of the chart.
   * All layers share the same tooltip,
   * which means no two tooltip popups will appear at the same time.
   */
  readonly tooltip: Tooltip

  /**
   * Once you specify the engine,
   * the corresponding graph root element will be created.
   */
  readonly root: D3Selection | Container

  /**
   * The theme of the chart.
   * @remarks
   * The theme cannot be updated dynamically,
   * it can only be specified through the constructor.
   */
  readonly theme: ChartTheme

  /**
   * The container for the outer layer of the chart.
   */
  readonly container: HTMLElement

  /**
   * Real width of the chart root.
   * @see root
   */
  readonly containerWidth: number

  /**
   * Real height of the chart root.
   * @see root
   */
  readonly containerHeight: number

  /**
   * The layout is divided into several layer areas,
   * and each layer is drawn in a specific area.
   */
  get layout() {
    return this._layout
  }

  /**
   * Get all layers of the current chart except sublayers,
   * because sublayers should be completely managed by the parent layer.
   */
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
    tooltipOptions,
  }: ChartProps) {
    this.theme = theme
    this.engine = engine
    this.container = container

    const domContainer = select(this.container).html('')

    if (adjust) {
      this.containerWidth = parseFloat(domContainer.style('width')) || width
      this.containerHeight = parseFloat(domContainer.style('height')) || width
    } else {
      this.containerWidth = width
      this.containerHeight = height
    }

    this.padding = [
      getPercentageNumber(padding[0], this.containerHeight),
      getPercentageNumber(padding[1], this.containerWidth),
      getPercentageNumber(padding[2], this.containerHeight),
      getPercentageNumber(padding[3], this.containerWidth),
    ]

    if (engine === 'canvas') {
      this.defs = []
      const app = new Application({
        resolution: window.devicePixelRatio,
        width: this.containerWidth,
        height: this.containerHeight,
        backgroundAlpha: 0,
        autoDensity: true,
        eventMode: 'static',
      })
      this.root = app.stage
      this.root.getApp = () => app
      this.event.once('destroy', uuid(), () => app.destroy())
      this.container.appendChild(app.view as HTMLCanvasElement)
      this.root.on('mousemove', ({nativeEvent: event}) => {
        this.event.fire('globalEvent', {event})
      })
    } else {
      this.root = domContainer
        .append('svg')
        .attr('width', this.containerWidth)
        .attr('height', this.containerHeight)
        .attr('xmlns', 'https://www.w3.org/2000/svg')
        .style('position', 'absolute')
      this.defs = this.root.append('defs')
      this.root.on('mousemove', (event) => {
        this.event.fire('globalEvent', {event})
      })
    }

    this._layout = layoutCreator({
      containerWidth: this.containerWidth,
      containerHeight: this.containerHeight,
      padding: this.padding,
    })

    this.tooltip = new Tooltip({
      ...tooltipOptions,
      container: tooltipOptions?.container ?? this.container,
      getLayersBackupData: () =>
        this._layers.flatMap(({interactive, cacheData}) =>
          interactive
            .map((sublayer) => cacheData[sublayer].data)
            .flatMap(noChange)
        ),
    })

    this.initializeLifeCycles()
    this.event.fire('initialized')
  }

  private initializeLifeCycles() {
    chartLifeCycles.forEach((name) => {
      const fn: AnyFunction = this[name] || noop

      this[name] = (...parameters: unknown[]) => {
        try {
          fn.call(this, ...parameters)
          this.event.fire(name, {...parameters})
        } catch (error) {
          this.log.error(`🎃 ${name} 🎃 call exception`, error)
          this.event.fire('error', {error})
        }
      }
    })
  }

  getLayerById(id: string) {
    return this.layers.find(({options}) => options.id === id)
  }

  getLayerByType<T extends LayerType>(type: T) {
    return (this.layers as LayerDict[T][]).find(({options}) => {
      return options.type === type
    })
  }

  getLayersByType<T extends LayerType>(type: T) {
    return (this.layers as LayerDict[T][]).filter(({options}) => {
      return options.type === type
    })
  }

  private get independentLayers() {
    return this.layers.filter(({options: {type}}) => {
      return !dependantLayers.has(type)
    })
  }

  private get nonUniqueLayers() {
    return this.layers.filter((layer) => {
      return !isLayerLegend(layer) && !isLayerAxis(layer)
    })
  }

  /**
   * Create a layer by options.
   * @remarks
   * - The layer ID is unique, if not specified, create random one.
   * - Each chart can only have one axis and legend layer.
   * - The layer type must be built-in or registered via `registerCustomLayer`.
   * @returns
   * Returns the layer instance if successful.
   */
  createLayer<T extends LayerType>(options: CreateLayerProps<T>) {
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

    if (!options.layout) {
      if (options.type === 'text' || options.type === 'legend') {
        options.layout = this.layout.container
      } else {
        options.layout = this.layout.main
      }
    }

    const layer = new LayerDict[options.type]({...options, ...context})
    this._layers.push(layer)

    return layer as Maybe<LayerDict[T]>
  }

  /**
   * This function is responsible for integrating the scales of all layers.
   */
  rebuildScale({trigger, redraw}: RebuildScaleProps) {
    const axisLayer = this.getLayerByType('axis'),
      legendLayer = this.getLayerByType('legend'),
      layers = this.independentLayers.concat(this.getLayersByType('brush'))

    if (!axisLayer) {
      throw new Error('There is no axis layer available')
    }

    layers.forEach((layer) => {
      const {scale, options} = layer,
        coordinate = axisLayer.style.coordinate,
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

    /**
     * The scale configuration is only for the merged scale.
     * The nice function is idempotent.
     */
    axisLayer.niceScale()

    /**
     * Only layers other than the trigger can be updated,
     * as updating the trigger may cause an infinite loop
     */
    this.layers.forEach((layer) => {
      const {axis} = layer.options,
        {scaleY, scaleYR, ...rest} = {...layer.scale, ...axisLayer.scale},
        finalScaleY = axis === 'minor' ? scaleYR : scaleY

      if (layer !== trigger) {
        layer !== axisLayer && layer.setScale({...rest, scaleY: finalScaleY})
        redraw && layer.draw()
      }
    })

    /**
     * Many layers need to change the legend after updating the data.
     * Be careful not to update the legend multiple times during initialization.
     */
    if (!isLayerLegend(trigger)) {
      legendLayer?.bindLayers(this.layers)
      legendLayer?.draw()
    }
  }

  /**
   * Since layers of different types may depend on each other,
   * you should use the chart drawing method.
   */
  draw() {
    const axisLayer = this.getLayerByType('axis')
    const legendLayer = this.getLayerByType('legend')

    this.independentLayers.forEach((layer) => layer.update())
    axisLayer && this.rebuildScale({redraw: false, trigger: legendLayer})
    this.nonUniqueLayers.forEach((layer) => layer.draw())

    axisLayer?.draw()
    if (isLayerLegend(legendLayer)) {
      legendLayer.bindLayers(this.layers)
      legendLayer.draw()
    }
  }

  /**
   * Release the space occupied by all layers and tooltip of the chart,
   * but will not destroy the root element.
   */
  destroy() {
    this.layers.forEach((layer) => layer.destroy())
    this._layers.length = 0
    this.tooltip.destroy()
  }
}
