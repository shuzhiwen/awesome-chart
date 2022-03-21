import {Scale, ScaleBand, ScaleLinear, ScaleNiceShape} from '../scale'

export type LayerAxisScaleShape = Maybe<{
  scaleX?: Scale
  scaleY?: Scale
  scaleAngle?: Scale
  scaleRadius?: Scale
  nice?: ScaleNiceShape
}>

export type LayerLineScaleShape = Maybe<{
  scaleX: ScaleBand
  scaleY: ScaleLinear
}>

export type LayerRectScaleShape = Maybe<{
  scaleX: ScaleBand | ScaleLinear
  scaleY: ScaleBand | ScaleLinear
}>
