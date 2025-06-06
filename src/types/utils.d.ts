import {Texture} from 'pixi.js'
import {D3Selection} from './draw'

export type Box = {
  x: number
  y: number
  width: number
  height: number
}

export type Stop = Partial<{
  color: string
  offset: number
  opacity: number
}>

export type LinearGradientSchema = {
  id: string
  x1?: number
  y1?: number
  x2?: number
  y2?: number
  width?: number
  height?: number
  stops: Stop[]
}

export type RadialGradientSchema = {
  id: string
  r?: number
  r2?: number
  x1?: number
  y1?: number
  x2?: number
  y2?: number
  width?: number
  height?: number
  stops: Stop[]
}

export type CreateDefsSchema = Partial<{
  linearGradient: MaybeGroup<LinearGradientSchema>
  radialGradient: MaybeGroup<RadialGradientSchema>
}>

export type GradientCreatorProps<Schema> = {
  container: D3Selection | Texture[]
  schema: Schema
}

export type EventCallback = AnyFunction & {
  /**
   * The event category that used to distinguish event sources.
   * @internal
   */
  category?: string
  /**
   * Is event handler first fired or not.
   * @remarks
   * When set undefined, event handler won't be destroy after first fired.
   * @internal
   */
  isOnceDone?: boolean
}

export type FormatNumberConfig = Partial<{
  /**
   * Is value transform to percentage string.
   */
  percentage: boolean // 0.1234 => 12.34%
  /**
   * Is value contain quantiles.
   */
  thousandth: boolean // 1234 => 1,234
  /**
   * The exact number of decimal places.
   */
  decimals: number // 12.3412312 => 12.34
  /**
   * Custom format function. Overrides all other options if provided.
   */
  formatter: (value: Maybe<Meta>) => string
}>

export type OverflowControlConfig = Partial<{
  /**
   * When value exceed width, `...` as suffix or not.
   */
  omit: boolean
  /**
   * The max string width available.
   */
  width: number
  /**
   * The max string height available.
   */
  height: number
  /**
   * The fontSize used to calculate text width and height.
   */
  fontSize: number
}>

export type EasyGradientCreatorProps = Partial<RadialGradientSchema> & {
  /**
   * Gradient type.
   */
  type: 'linear' | 'radial'
  /**
   * Direction of linear gradient.
   */
  direction?: 'horizontal' | 'vertical'
  /**
   * Gradient colors.
   */
  colors: string[]
}

export type RandomNumberOptions = {
  /**
   * Create a number in `normal` way or `poisson` way.
   */
  mode: 'normal' | 'poisson'
  /**
   * The exact number of decimal places.
   */
  decimals?: number
  /**
   * Is available when mode is `poisson`.
   */
  lambda?: number
  /**
   * Is available when mode is `normal`, defaults to 1.
   */
  sigma?: number
  /**
   * Is available when mode is `normal`, defaults to 0.
   */
  mu?: number
  /**
   * Make sure the number is positive.
   */
  abs?: boolean
}

export type RandomTableListOptions = RandomNumberOptions & {
  /**
   * Whether numbers have `asc` order or `desc` order.
   */
  sort?: 'desc' | 'asc'
  /**
   * The row number of table or tableList.
   */
  row: number
  /**
   * The column number of table or tableList.
   */
  column: number
}

export type RandomRelationOptions = RandomNumberOptions & {
  /**
   * The number of nodes to generate.
   */
  node: number
  /**
   * Density of edges, between 0 and 1.
   */
  density: number
  /**
   * The maximum depth of the directed acyclic graph.
   */
  level: number
}
