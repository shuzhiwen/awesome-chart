import {DataTableList} from '../data'
import {scaleBand, scaleLinear, scaleAngle} from '../scales'

export type ScaleAngle = ReturnType<typeof scaleAngle>

export type ScaleBand = ReturnType<typeof scaleBand>

export type ScaleLinear = ReturnType<typeof scaleLinear>

export interface RawScale<Domain = any> {
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

export type ScaleNiceShape = ScaleLinearNice & ScaleBandNice & ScaleArcNice

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
