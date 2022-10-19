import {DrawerTarget} from './draw'
import {LayoutArea} from './layout'
import {LayerType} from './base'

type BasicLayerOptions<
  Type extends LayerType,
  Options extends AnyObject = Record<never, never>
> = Partial<Options> & {
  id: string
  type: Type
  layout: LayoutArea
  axis?: 'main' | 'minor'
  coordinate?: Coordinate
  sublayerConfig?: {
    root: DrawerTarget
  }
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
  | LayerForceOptions
  | LayerCarouselOptions
  | LayerRadialOptions
  | LayerWaveOptions
  | LayerGridOptions

export type LayerInteractiveOptions = BasicLayerOptions<'interactive'>

export type LayerLegendOptions = BasicLayerOptions<'legend'>

export type LayerTextOptions = BasicLayerOptions<'text'>

export type LayerScatterOptions = BasicLayerOptions<'scatter'>

export type LayerMatrixOptions = BasicLayerOptions<'matrix'>

export type LayerBasemapOptions = BasicLayerOptions<'basemap'>

export type LayerHeatmapOptions = BasicLayerOptions<'heatmap'>

export type LayerODLineOptions = BasicLayerOptions<'odLine'>

export type LayerForceOptions = BasicLayerOptions<'force'>

export type LayerTreemapOptions = BasicLayerOptions<'treemap'>

export type LayerSankeyOptions = BasicLayerOptions<'sankey'>

export type LayerTreeOptions = BasicLayerOptions<'tree'>

export type LayerDashboardOptions = BasicLayerOptions<'dashboard'>

export type LayerMarkOptions = BasicLayerOptions<'mark'>

export type LayerBrushOptions = BasicLayerOptions<'brush'>

export type LayerAuxiliaryOptions = BasicLayerOptions<'auxiliary'>

export type LayerCandleOptions = BasicLayerOptions<'candle'>

export type LayerRadialOptions = BasicLayerOptions<'radial'>

export type LayerWaveOptions = BasicLayerOptions<'wave'>

export type LayerGridOptions = BasicLayerOptions<'grid'>

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

export type LayerPackOptions = BasicLayerOptions<
  'pack',
  {
    variant: 'pack' | 'wordCloud'
  }
>

export type LayerCarouselOptions = BasicLayerOptions<
  'carousel',
  {
    mode: 'slide' | 'fade'
  }
>
