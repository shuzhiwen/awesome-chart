import {DataTableList} from '../data'
import {scaleBand, scaleLinear, scaleAngle} from '../scales'
import {ScalePoint, ScaleQuantize} from 'd3'

export type ScaleAngle = ReturnType<typeof scaleAngle>

export type ScaleBand = ReturnType<typeof scaleBand>

export type ScaleLinear = ReturnType<typeof scaleLinear>

export type RawScale<Domain = any> = {
  (input: Domain): any
}

export interface Scale<Domain = any> extends RawScale<Domain> {
  domain(): Domain[]
  domain(domain: Iterable<Domain>): this
  range(): any[]
  range(range: Iterable<any>): this
}

export type ScaleLinearNice = Partial<{
  count: number
  zero: boolean
  fixedStep: number
  fixedStart: number
}>

export type ScaleBandNice = Partial<{
  paddingInner: number
  fixedPaddingInner: number
  fixedBandwidth: number
  fixedBoundary: 'start' | 'end'
}>

export type ScaleArcNice = Partial<{
  paddingInner: number
}>

export type ScaleNice = ScaleLinearNice & ScaleBandNice & ScaleArcNice

export type ScaleBandProps = {
  domain: Meta[]
  range: [number, number]
  nice?: ScaleBandNice
}

export type ScaleLinearProps = {
  domain: [number, number]
  range: [number, number]
  nice?: ScaleLinearNice
}

export type ScaleArcProps = {
  domain: DataTableList
  range: [number, number]
  nice?: ScaleArcNice
}

export type ScaleArcRangeItem = {
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
