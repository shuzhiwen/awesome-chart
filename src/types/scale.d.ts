import {DataTableList} from '../data'
import {scaleBand, scaleLinear, scaleAngle} from '../scales'

export type ScaleAngle = ReturnType<typeof scaleAngle>

export type ScaleBand = ReturnType<typeof scaleBand>

export type ScaleLinear = ReturnType<typeof scaleLinear>

export interface Scale<Domain = any> {
  (x: Domain): any
  domain(): Domain[]
  domain(domain: Iterable<Domain>): this
  range(): any[]
  range(range: Iterable<any>): this
}

export interface ScaleNiceShape {
  count?: number
  zero?: boolean
  paddingInner?: number
  fixedPaddingInner?: number
  fixedBandwidth?: number
  fixedBoundary?: 'start' | 'end'
}

export interface ScaleBandProps {
  domain: string[]
  range: [number, number]
  nice?: ScaleNiceShape
}

export interface ScaleLinearProps {
  domain: [number, number]
  range: [number, number]
  nice?: Pick<ScaleNiceShape, 'count' | 'zero'>
}

export interface ScaleArcProps {
  domain: DataTableList
  range: [number, number]
  nice?: Pick<ScaleNiceShape, 'paddingInner'>
}

export interface ScaleArcRangeItem {
  startAngle: number
  endAngle: number
}
