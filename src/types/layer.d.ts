import {AnimationQueue} from '../anims'
import {commonEvents, tooltipEvents} from '../core'
import {LayerBase, LayerDict} from '../layers'
import {AnimationOptions, UpdateAnimationOptions} from './animation'
import {ChartContext} from './core'
import {LegendData} from './data'
import {
  DrawerDictProps,
  DrawerTarget,
  DrawerType,
  GraphDrawerProps,
} from './draw'
import {LayoutArea} from './layout'
import {RawScale, ScaleNice} from './scale'
import {TextStyle} from './styles'

export type LayerType = Keys<LayerDict>

/**
 * Drawing data will be cached each time.
 * This cache use for show tooltip or support update animation etc.
 */
export type CacheLayerData<Key extends string> = Record<
  Key,
  {
    data: Omit<GraphDrawerProps<unknown>, 'className' | 'container' | 'theme'>[]
    /**
     * Mapping from dimension to group index.
     * In order to avoid wrong data update animation.
     */
    order?: Map<Maybe<Meta>, number>
  }
>

export type CacheLayerAnimation<Key extends string> = {
  /**
   * Mapping from sublayer to timer.
   * Loop animation should await for update animation after draw.
   */
  timer: Record<string, NodeJS.Timeout>
  /**
   * Animation instance for control.
   */
  animations: Partial<Record<Key, Maybe<AnimationQueue>>>
  /**
   * Animation options for config.
   *
   * There are three animation types:
   * - `enter`: Trigger when chart loaded.
   * - `loop`: Always running while chart available.
   * - `update`: Trigger when chart occur data updating.
   */
  options: Partial<
    Record<
      Key,
      Partial<
        Record<'enter' | 'loop', MaybeGroup<AnimationOptions>> & {
          update: Partial<UpdateAnimationOptions>
        }
      >
    >
  >
}

/**
 * Cache all events to avoid double binding event listeners.
 * - `common`: Events that include normal interactions.
 * - `tooltip`: Events for tooltip only.
 * @internal
 */
export type CacheLayerEvent<Key extends string> = Readonly<
  Record<`common.${Keys<typeof commonEvents>}`, Record<Key, AnyFunction>> &
    Record<`tooltip.${Keys<typeof tooltipEvents>}`, AnyFunction>
>

export type LayerBaseProps<Key extends string> = Readonly<{
  options: LayerOptions
  /**
   * @see LayerBase.sublayers
   */
  sublayers?: Key[]
  /**
   * @see LayerBase.interactive
   */
  interactive?: Key[]
}>

export type DrawBasicProps<T extends DrawerType, Key extends string> = {
  /**
   * Basic element type, export type of drawer.
   */
  type: T
  /**
   * Drawing data for a sublayer.
   */
  data: (Omit<
    DrawerDictProps<T>,
    'className' | 'container' | 'theme' | 'source'
  > & {
    data: {meta?: GraphDrawerProps<unknown>['source'][number]['meta']}[]
    disableUpdateAnimation?: boolean
  })[]
  /**
   * @see LayerBaseProps.sublayers
   */
  key: Key
}

export type LayerOptions<T extends LayerType = LayerType> = ChartContext & {
  id: string
  type: T
  layout: LayoutArea
  /**
   * Determine the layer binding scaleY or scaleYR.
   */
  axis?: 'main' | 'minor'
  /**
   * The sublayer needs the root of the parent layer to generate the root.
   * Chart methods do not return sublayers.
   * @internal
   */
  sublayerConfig?: {
    root: DrawerTarget
  }
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

export type LayerInstance = LayerBase<string> & {
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
