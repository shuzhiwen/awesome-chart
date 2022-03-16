import {DataTableList} from '../data'
import {scaleBand, scaleLinear, scaleArc} from '../scales'

export type ScaleArc = ReturnType<typeof scaleArc>

export type ScaleBand = ReturnType<typeof scaleBand>

export type ScaleLinear = ReturnType<typeof scaleLinear>

export type Scale = ScaleArc | ScaleBand | ScaleLinear

export type ScaleNiceShape = {
  count?: number
  zero?: boolean
  paddingInner?: number
  fixedPaddingInner?: number
  fixedBandwidth?: number
  fixedBoundary?: 'start' | 'end'
}

export interface ScaleBandProps {
  type: 'band'
  domain: string[]
  range: [number, number]
  nice: ScaleNiceShape
}

export interface ScaleLinearProps {
  type: 'linear'
  domain: [number, number]
  range: [number, number]
  nice: Pick<ScaleNiceShape, 'count' | 'zero'>
}

export interface ScaleArcProps {
  type: 'linear'
  domain: DataTableList
  range: [number, number]
  nice: Pick<ScaleNiceShape, 'paddingInner'>
}
