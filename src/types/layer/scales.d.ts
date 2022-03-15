import {scaleBand, scaleLinear, scaleArc} from '../../data'

export type ScaleArc = ReturnType<typeof scaleArc>

export type ScaleBand = ReturnType<typeof scaleBand>

export type ScaleLinear = ReturnType<typeof scaleLinear>

export type Scale = ScaleArc | ScaleBand | ScaleLinear

export type LayerNormalScaleShape = {
  scaleX?: ScaleBand
  scaleY?: ScaleLinear
}
