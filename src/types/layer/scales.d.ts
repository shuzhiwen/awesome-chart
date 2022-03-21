import {Scale, ScaleBand, ScaleLinear, ScaleNiceShape} from '../scale'

export type LayerNormalScaleShape = Maybe<{
  scaleX: ScaleBand
  scaleY: ScaleLinear
}>

export type LayerAxisScaleShape = Maybe<{
  scaleX?: Scale
  scaleY?: Scale
  scaleAngle?: Scale
  scaleRadius?: Scale
  nice?: ScaleNiceShape
}>
