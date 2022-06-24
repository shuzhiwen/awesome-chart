import {LayoutArea} from '../layout'
import {LayerType} from './base'

type BasicLayerOptions<
  T extends LayerType,
  P extends AnyObject = Record<never, never>
> = Partial<P> & {
  id: string
  type: T
  layout: LayoutArea
  sublayer?: boolean
  coordinate?: Coordinate
  axis?: 'main' | 'minor'
}

export type LayerOptions =
  | LayerAxisOptions
  | LayerAuxiliaryOptions
  | LayerLineOptions
  | LayerRectOptions
  | LayerArcOptions
  | LayerFlopperOptions
  | LayerTextOptions
  | LayerInteractiveOptions
  | LayerLegendOptions
  | LayerScatterOptions
  | LayerBasemapOptions
  | LayerHeatmapOptions
  | LayerODLineOptions
  | LayerPackOptions
  | LayerSankeyOptions
  | LayerTreemapOptions
  | LayerTreeOptions
  | LayerMatrixOptions
  | LayerRadarOptions
  | LayerDashboardOptions
  | LayerMarkOptions
  | LayerBrushOptions
  | LayerCandleOptions

export type LayerInteractiveOptions = BasicLayerOptions<'interactive'>

export type LayerLegendOptions = BasicLayerOptions<'legend'>

export type LayerTextOptions = BasicLayerOptions<'text'>

export type LayerScatterOptions = BasicLayerOptions<'scatter'>

export type LayerMatrixOptions = BasicLayerOptions<'matrix'>

export type LayerBasemapOptions = BasicLayerOptions<'basemap'>

export type LayerHeatmapOptions = BasicLayerOptions<'heatmap'>

export type LayerODLineOptions = BasicLayerOptions<'odLine'>

export type LayerPackOptions = BasicLayerOptions<'pack'>

export type LayerTreemapOptions = BasicLayerOptions<'treemap'>

export type LayerSankeyOptions = BasicLayerOptions<'sankey'>

export type LayerTreeOptions = BasicLayerOptions<'tree'>

export type LayerDashboardOptions = BasicLayerOptions<'dashboard'>

export type LayerMarkOptions = BasicLayerOptions<'mark'>

export type LayerBrushOptions = BasicLayerOptions<'brush'>

export type LayerAuxiliaryOptions = BasicLayerOptions<'auxiliary'>

export type LayerCandleOptions = BasicLayerOptions<'candle'>

export type LayerAxisOptions = BasicLayerOptions<
  'axis',
  {
    coordinate: Coordinate
  }
>

export type LayerLineOptions = BasicLayerOptions<
  'line',
  {
    mode: 'cover' | 'stack'
  }
>

export type LayerRadarOptions = BasicLayerOptions<
  'radar',
  {
    mode: 'cover' | 'stack'
  }
>

export type LayerRectOptions = BasicLayerOptions<
  'rect',
  {
    variant: 'column' | 'bar'
    mode: 'cover' | 'group' | 'stack' | 'interval' | 'waterfall' | 'percentage'
    sort: 'asc' | 'desc'
  }
>

export type LayerArcOptions = BasicLayerOptions<
  'arc',
  {
    variant: 'pie' | 'nightingaleRose'
  }
>

export type LayerFlopperOptions = BasicLayerOptions<
  'flopper',
  {
    variant: 'vertical' | 'flop'
  }
>
