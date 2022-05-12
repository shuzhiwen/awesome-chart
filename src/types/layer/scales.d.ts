import {RawScale, Scale, ScaleAngle, ScaleBand, ScaleLinear, ScaleNiceShape} from '../scale'

export type LayerAxisScaleShape = Maybe<
  Partial<{
    scaleX: Scale
    scaleY: Scale
    scaleYR: Scale
    scaleAngle: Scale
    scaleRadius: Scale
    nice: ScaleNiceShape
  }>
>

export type LayerAuxiliaryScaleShape = Maybe<
  Partial<{
    scaleX: Scale
    scaleY: Scale
  }>
>

export type LayerLineScaleShape = Maybe<{
  scaleX: ScaleBand
  scaleY: ScaleLinear
}>

export type LayerScatterScaleShape = Maybe<{
  scaleX: ScaleLinear
  scaleY: ScaleLinear
  scalePointSize: ScaleLinear
}>

export type LayerRectScaleShape = Maybe<{
  scaleX: ScaleBand | ScaleLinear
  scaleY: ScaleBand | ScaleLinear
}>

export type LayerBaseMapScaleShape = Maybe<{
  scaleX: RawScale
  scaleY: RawScale
}>

export type LayerArcScaleShape = Maybe<{
  scaleAngle: ScaleAngle
  scaleRadius: ScaleLinear
}>
