import {ScalePoint, ScaleQuantize} from 'd3'
import {scaleAngle, scaleBand, scaleLinear} from '../scales'

export type ScaleAngle = ReturnType<typeof scaleAngle>

export type ScaleBand = ReturnType<typeof scaleBand>

export type ScaleLinear = ReturnType<typeof scaleLinear>

export type RawScale<Domain = any> = {
  (input: Domain): any
}

interface Scale<Domain = any> extends RawScale<Domain> {
  domain(): Domain[]
  domain(domain: Iterable<Domain>): this
  range(): any[]
  range(range: Iterable<any>): this
}

export type ScaleLinearNice = Partial<{
  /**
   * The number of coordinate dividing lines.
   */
  count: number
  /**
   * When set true, `0` will be included in linear domain.
   */
  zero: boolean
  /**
   * Sets the length between dividing lines to the specified value.
   */
  fixedStep: number
  /**
   * Sets the first value of linear domain.
   * Usually used with `fixedStep`.
   */
  fixedStart: number
}>

export type ScaleBandNice = Partial<{
  /**
   * Sets the inner padding to the specified percentage value
   * which must be in the range [0, 1].
   * The inner padding determines the ratio of the range
   * that is reserved for blank space between bands.
   *
   * The default setting is 0.
   */
  paddingInner: number
  /**
   * Sets the inner padding to the specified value
   * while `paddingInner` will be ignored.
   */
  fixedPaddingInner: number
  /**
   * Sets the width of each band to the specified value
   * while `paddingInner` will be ignored.
   */
  fixedBandwidth: number
  /**
   * Determines how the domain is attach to the range
   * when both `fixedBandwidth` and `fixedPaddingInner` are set.
   */
  fixedBoundary: 'start' | 'end'
}>

export type ScaleArcNice = Partial<{
  /**
   * Sets the inner padding to the specified percentage value
   * which must be in the range [0, 1].
   * The inner padding determines the ratio of the range
   * that is reserved for blank space between bands.
   *
   * The default setting is 0.
   */
  paddingInner: number
}>

export type ScaleNice = ScaleLinearNice & ScaleBandNice & ScaleArcNice

export type ScaleBandProps = {
  domain: Meta[]
  range: Vec2
  nice?: ScaleBandNice
}

export type ScaleLinearProps = {
  domain: Vec2
  range: Vec2
  nice?: ScaleLinearNice
}

export type ScaleArcProps = {
  domain: Vec2<Meta[]>
  range: Vec2
  nice?: ScaleArcNice
}

export type ScaleArcRangeItem = {
  weight: Meta
  startAngle: number
  endAngle: number
}

export type LayerAxisScale = Partial<{
  scaleX: Scale
  scaleY: Scale
  scaleYR: Scale
  scaleAngle: Scale
  scaleRadius: Scale
  scaleColor: Scale
  nice: ScaleNice
}>

export type LayerAuxiliaryScale = Maybe<{
  scaleX?: Scale
  scaleY?: Scale
}>

export type LayerLineScale = Maybe<{
  scaleX: ScaleBand
  scaleY: ScaleLinear
}>

export type LayerRadarScale = Maybe<{
  scaleAngle: ScaleBand
  scaleRadius: ScaleLinear
}>

export type LayerRadialScale = Maybe<{
  scaleAngle: ScaleLinear
  scaleRadius: ScaleBand
}>

export type LayerScatterScale = Maybe<{
  scaleX: ScaleLinear
  scaleY: ScaleLinear
  scalePointSize: ScaleLinear
}>

export type LayerRectScale = Maybe<{
  scaleX: ScaleBand | ScaleLinear
  scaleY: ScaleBand | ScaleLinear
}>

export type LayerBasemapScale = Maybe<{
  scaleX: RawScale
  scaleY: RawScale
}>

export type LayerHeatmapScale = Maybe<{
  scaleX: RawScale
  scaleY: RawScale
}>

export type LayerODLineScale = Maybe<{
  scaleX: RawScale
  scaleY: RawScale
}>

export type LayerMarkScale = Maybe<{
  scaleX: RawScale
  scaleY: RawScale
}>

export type LayerArcScale = Maybe<{
  scaleAngle: ScaleAngle
  scaleRadius: ScaleLinear
}>

export type LayerTreeScale = Maybe<{
  scaleX: ScalePoint<number>
  scaleY: ScalePoint<number>
}>

export type LayerMatrixScale = Maybe<{
  scaleX: ScaleBand
  scaleY: ScaleBand
  scaleColor?: ScaleQuantize<string>
}>
