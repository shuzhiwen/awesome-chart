import {ScalePoint} from 'd3'
import {RawScale, Scale, ScaleAngle, ScaleBand, ScaleLinear, ScaleNiceShape} from '../scale'

export type LayerAxisScaleShape = Partial<{
  scaleX: Scale
  scaleY: Scale
  scaleYR: Scale
  scaleAngle: Scale
  scaleRadius: Scale
  nice: ScaleNiceShape
}>

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

export type LayerRadarScaleShape = Maybe<{
  scaleAngle: ScaleBand
  scaleRadius: ScaleLinear
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

export type LayerBasemapScaleShape = Maybe<{
  scaleX: RawScale
  scaleY: RawScale
}>

export type LayerHeatmapScaleShape = Maybe<{
  scaleX: RawScale
  scaleY: RawScale
}>

export type LayerODLineScaleShape = Maybe<{
  scaleX: RawScale
  scaleY: RawScale
}>

export type LayerMarkScaleShape = Maybe<{
  scaleX: RawScale
  scaleY: RawScale
}>

export type LayerArcScaleShape = Maybe<{
  scaleAngle: ScaleAngle
  scaleRadius: ScaleLinear
}>

export type LayerTreeScaleShape = Maybe<{
  scaleX: ScalePoint<number>
  scaleY: ScalePoint<number>
}>

export type LayerMatrixScaleShape = Maybe<{
  scaleX: ScaleBand
  scaleY: ScaleBand
}>
