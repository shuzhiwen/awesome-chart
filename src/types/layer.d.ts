import {AnimationQueue} from '../animation'
import {LayerBase, LayerDict} from '../layers'
import {commonEvents, tooltipEvents} from '../utils'
import {AnimationOptions} from './animation'
import {ChartContext} from './core'
import {LegendData} from './data'
import {DrawerDictProps, DrawerType, GraphDrawerProps} from './draw'
import {LayerOptions} from './options'
import {RawScale, ScaleNice} from './scale'
import {TextStyle} from './styles'

export type LayerType = Keys<typeof LayerDict>

export type LayerDictInstance<
  T extends LayerType,
  P extends typeof LayerDict[T] = typeof LayerDict[T]
> = InstanceType<P>

/**
 * Drawing data will be cached each time.
 * This cache use for show tooltip or support update animation etc.
 */
export type CacheLayerData<Datum> = Record<
  string,
  {
    data: Omit<GraphDrawerProps<Datum>, 'className' | 'container' | 'theme'>[]
    /**
     * Mapping from dimension to group index.
     * In order to avoid wrong data update animation.
     */
    order?: Map<Meta, number>
  }
>

export type CacheLayerAnimation<Options = AnimationOptions> = {
  /**
   * Mapping from sublayer to timer.
   * Loop animation should await for update animation after draw.
   */
  timer: Record<string, NodeJS.Timeout>
  /**
   * Animation instance for control.
   */
  animations: Record<string, Maybe<AnimationQueue>>
  /**
   * Animation options for config.
   *
   * There are three animation types:
   * - `enter`: Trigger when chart loaded.
   * - `loop`: Always running while chart available.
   * - `update`: Trigger when chart occur data updating.
   */
  options: Record<
    string,
    Partial<Record<'enter' | 'loop', MaybeGroup<Options>> & {update: Options}>
  >
}

/**
 * Cache all events to avoid double binding event listeners.
 * - `common`: Events that include normal interactions.
 * - `tooltip`: Events for tooltip only.
 * @internal
 */
export type CacheLayerEvent = Readonly<
  Record<`common.${Keys<typeof commonEvents>}`, Record<string, AnyFunction>> &
    Record<`tooltip.${Keys<typeof tooltipEvents>}`, AnyFunction>
>

export type LayerBaseProps<Options extends LayerOptions> = Readonly<{
  context: ChartContext
  options: Options
  /**
   * @see LayerBase.sublayers
   */
  sublayers?: string[]
  /**
   * @see LayerBase.interactive
   */
  interactive?: string[]
}>

export type DrawBasicProps<T extends DrawerType> = {
  /**
   * Basic element type, type of drawer.
   */
  type: T
  /**
   * Drawing data for a sublayer.
   */
  data: (Omit<DrawerDictProps<T>, 'className' | 'container' | 'theme' | 'source'> & {
    source?: GraphDrawerProps<unknown>['source']
    disableUpdateAnimation?: boolean
  })[]
  /**
   * @see LayerBaseProps.sublayers
   */
  sublayer?: string
}

export type LayerScale = Partial<{
  /**
   * Scale for horizontal, available in cartesian coordinate.
   */
  scaleX: RawScale
  /**
   * Scale for vertical, available in cartesian coordinate.
   */
  scaleY: RawScale
  /**
   * Scale for vertical, available in polar coordinate.
   */
  scaleYR: RawScale
  /**
   * Scale for angle, available in polar coordinate.
   */
  scaleAngle: RawScale
  /**
   * Scale for radius, available in polar coordinate.
   */
  scaleRadius: RawScale
  scaleColor: RawScale
  nice: ScaleNice
}>

export type LayerInstance = LayerBase<LayerOptions> & {
  /**
   * If scale is declared, it will be captured by the axis layer.
   */
  scale?: Maybe<LayerScale>
  /**
   * If legend data is declared, it will be captured by the legend layer.
   */
  legendData?: Maybe<LegendData>
}

export type CreateTextProps = {
  value: Maybe<Meta>
  /**
   * Relative horizontal position of text.
   */
  x: number
  /**
   * Relative vertical position of text.
   */
  y: number
  /**
   * The text-associated style configuration.
   */
  style?: TextStyle
  /**
   * The anchor of the text, defaults to 'leftBottom'.
   */
  position?: Position9
  /**
   * Single offset in one direction, different from `TextStyle.offset`.
   */
  offset?: number
}

export type CreateLimitTextProps = CreateTextProps & {
  maxTextWidth: number
}

export type CreateColorMatrixProps = {
  layer: LayerInstance
  /**
   * The row number of colorMatrix.
   */
  row: number
  /**
   * The column number of colorMatrix.
   */
  column: number
  /**
   * The origin colors for `ColorMatrix`.
   */
  theme: MaybeGroup<string>
}
