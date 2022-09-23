import {LayerBase, layerMapping} from '../layers'
import {DrawerType, GraphDrawerProps} from './draw'
import {commonEvents, tooltipEvents} from '../utils'
import {RawScale, ScaleNice} from './scale'
import {AnimationOptions} from './animation'
import {AnimationQueue} from '../animation'
import {ChartContext} from './core'
import {LayerOptions} from './options'
import {TextStyle} from './styles'
import {LegendData} from './data'

export type LayerType = keyof typeof layerMapping

export type CacheLayerData<T> = Record<
  string,
  {
    data: Omit<GraphDrawerProps<T>, 'className' | 'container' | 'theme'>[]
    order?: Map<Meta, number>
  }
>

export type CacheLayerAnimation<T = AnimationOptions> = {
  timer: Record<string, NodeJS.Timeout>
  animations: Record<string, Maybe<AnimationQueue>>
  options: Record<string, Partial<Record<'enter' | 'loop' | 'update', T>>>
}

export type CacheLayerEvent = Readonly<
  Record<FlatName<['common', SetKeys<typeof commonEvents>]>, Record<string, AnyFunction>> &
    Record<FlatName<['tooltip', SetKeys<typeof tooltipEvents>]>, AnyFunction>
>

export type LayerBaseProps<T extends LayerOptions> = Readonly<{
  context: ChartContext
  options: T
  sublayers?: string[]
  tooltipTargets?: string[]
}>

export type DrawBasicProps<T> = {
  type: DrawerType
  data: (Omit<GraphDrawerProps<T>, 'className' | 'container' | 'theme' | 'source'> &
    Partial<Pick<GraphDrawerProps<T>, 'source'>>)[]
  sublayer?: string
}

export type LayerScale = Partial<{
  scaleX: RawScale
  scaleY: RawScale
  scaleYR: RawScale
  scaleAngle: RawScale
  scaleRadius: RawScale
  scaleColor: RawScale
  nice: ScaleNice
}>

export type LayerInstance = LayerBase<LayerOptions> & {
  scale?: Maybe<LayerScale>
  legendData?: Maybe<LegendData>
}

export type CreateTextProps = {
  x: number
  y: number
  value: Maybe<Meta>
  style?: TextStyle
  position?: Position9
  offset?: number
}

export type CreateLimitTextProps = CreateTextProps & {
  maxTextWidth: number
}

export type CreateColorMatrixProps = {
  layer: LayerInstance
  row: number
  column: number
  theme: MaybeGroup<string>
  nice?: boolean
}
