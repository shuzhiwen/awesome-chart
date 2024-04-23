import {Chart} from '../core'
import {LayerDict} from '../layers'
import {getEasyGradientCreator} from '../utils'
import {
  AnimationOptions,
  LayerAnimation,
  UpdateAnimationOptions,
} from './animation'
import {TooltipData} from './data'
import {ElConfig} from './draw'
import {
  CacheLayerAnimation,
  CacheLayerData,
  LayerInstance,
  LayerOptions,
  LayerType,
} from './layer'
import {LayoutCreator} from './layout'
import {LayerAxisScale} from './scale'

/**
 * The context for layer from chart includes some global data.
 * The context will be delivered to the layer when create the layer.
 */
type ChartContext = {
  /**
   * A easy way to create gradient.
   */
  createGradient: ReturnType<typeof getEasyGradientCreator>
  /**
   * This is marked version of `createLayer`.
   */
  createSublayer: Chart['createLayer']
} & Pick<
  Chart,
  | 'container'
  | 'containerWidth'
  | 'containerHeight'
  | 'rebuildScale'
  | 'event'
  | 'root'
  | 'theme'
  | 'tooltip'
>

type ChartTheme = Readonly<{
  /**
   * The theme color of the chart.
   * If there is no element color is specified,
   * the theme color will be used to generated the `ColorMatrix`.
   */
  palette: {
    main: string[]
    /**
     * If sets, nice colors.
     * @see ColorMatrix.nice
     */
    nice?: {
      maxDistance: number
      colorSpace: Keys<chroma.ColorSpaces>
    }
  }
  /**
   * Global default graph style.
   * @see GraphStyle
   */
  graph: {
    fill: string
    stroke: string
    opacity: number
    fillOpacity: number
    strokeOpacity: number
    strokeWidth: number
    evented: boolean
  }
  /**
   * Global default text style.
   * @see TextStyle
   */
  text: {
    fontFamily: string
    fontSize: number
    fontWeight: string
    shadow: string
    fill: string
    stroke: string
    opacity: number
    fillOpacity: number
    strokeOpacity: number
    strokeWidth: number
    evented: boolean
  }
  /**
   * Global default animation config.
   * Presets are some configured animation that out of box.
   */
  animation: Record<'presets', Record<string, AnimationOptions>> &
    Record<'enter' | 'loop' | 'update', UpdateAnimationOptions>
}>

type TooltipOptions = Partial<{
  /**
   * Container in which the tooltip is rendered.
   * Custom container will replace the default container.
   */
  container: HTMLElement | null
  /**
   * Display mode of layer tooltip data.
   * - `single`: Only display data for a single element.
   * - `dimension`: Displays all element data with the same dimension value.
   * - `category`: Displays all element data with the same category value.
   */
  mode: 'single' | 'dimension' | 'category'
  /**
   * The size of each row of data points.
   */
  pointSize: number
  /**
   * The fontSize of title text.
   */
  titleSize: number
  /**
   * The fontSize of each row of label text on the left.
   */
  labelSize: number
  /**
   * The fontSize of each row of value text on the right.
   */
  valueSize: number
  /**
   * The color of each row of label and value.
   */
  textColor: string
  /**
   * The backgroundColor of tooltip root.
   */
  backgroundColor: string
  /**
   * Custom render method that replace default render method.
   */
  render: (container: HTMLElement, data: Partial<ElConfig>) => void
  /**
   * Set custom render data replaces default render data that from layers.
   * @remarks
   * This method will use default render method.
   */
  setTooltipData: (data: TooltipData, options: TooltipOptions) => TooltipData
  /**
   * Tool function provided by the chart to obtain layer's data.
   */
  getLayersBackupData: () => CacheLayerData<string>['data']['data']
}>

type RebuildScaleProps = Partial<{
  /**
   * Trigger layer is the layer that do not want to be updated after merged scale.
   */
  trigger: LayerInstance
  /**
   * Whether all layers requiring scales are redrawn after merged scale.
   */
  redraw: boolean
}>

type ChartProps = {
  /**
   * Chart DOM element.
   */
  container: HTMLElement
} & Partial<{
  /**
   * The width of chart root which will be ignored when `adjust` is true.
   */
  width: number
  /**
   * The height of chart root which will be ignored when `adjust` is true.
   */
  height: number
  /**
   * Adjust width and height of chart root to fit container or not.
   */
  adjust: boolean
  /**
   * Render the chart in svg mode or canvas mode.
   */
  engine: Engine
  /**
   * Theme define defaults for styles and animations.
   * Theme will be passed as a parameter to the function when setStyle & setAnimation.
   */
  theme: ChartTheme
  /**
   * Paddings from the main drawing area to the chart container.
   */
  padding: Padding<Meta>
  /**
   * The generator function that returns the layout.
   */
  layoutCreator: LayoutCreator
  /**
   * The configuration of the tooltip of chart.
   */
  tooltipOptions: Partial<TooltipOptions>
}>

type CreateLayerProps<T extends LayerType> = Omit<
  LayerOptions<T>,
  Keys<ChartContext>
>

type CreateChartProps = ChartProps & {
  /**
   * Handle error when chart throw errors.
   * @remarks
   * The default `onError` handler will display error message in the graph.
   */
  onError?: (data?: {error?: Error}) => void
  /**
   * Definition of all layers, including axis and legend.
   */
  layers: ({
    /**
     * Internal layer type or custom layer type.
     */
    type: LayerType
  } & Partial<{
    /**
     * The options of the layer.
     * When options changes, chart will redraw.
     */
    options: Omit<LayerOptions, 'type' | 'layout'> & {
      /**
       * The name of layout that created by layoutCreator.
       */
      layout?: string
    }
    /**
     * Scale nice options only for axis layer.
     */
    scale: LayerAxisScale['nice']
    /**
     * Unrecognized data will be converted to `DataBase`.
     */
    data: NonNullable<LayerDict[LayerType]['data']>['source']
    /**
     * The style will override the default style.
     * Computable style that takes the theme as a parameter.
     */
    style: Partial<NonNullable<LayerDict[LayerType]>['style']>
    /**
     * The animation will define animation for sublayers.
     * Computable animation that takes the theme as a parameter.
     */
    animation: LayerAnimation<CacheLayerAnimation<string>['options']>
    /**
     * Configuration data for the eventName-handler map.
     */
    event: Record<string, AnyFunction>
  }>)[]
}
