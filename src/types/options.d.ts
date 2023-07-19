import {LayerType} from './base'
import {DrawerTarget} from './draw'
import {LayoutArea} from './layout'

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
  | LayerChordOptions

type BasicLayerOptions<
  Type extends LayerType,
  Options extends AnyObject = Record<never, never>
> = Partial<Options> & {
  id: string
  type: Type
  layout: LayoutArea
  /**
   * Determine the layer binding scaleY or scaleYR.
   */
  axis?: 'main' | 'minor'
  /**
   * Scale nice options only for axis layer.
   */
  coordinate?: Coordinate
  /**
   * The sublayer needs the root of the parent layer to generate the root.
   * Chart methods do not return sublayers.
   * @internal
   */
  sublayerConfig?: {
    root: DrawerTarget
  }
}

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

export type LayerChordOptions = BasicLayerOptions<'chord'>

export type LayerAxisOptions = BasicLayerOptions<
  'axis',
  {
    /**
     * Determines which coordinate system the current chart is.
     * A chart can only have one coordinate system.
     */
    coordinate: Coordinate
  }
>

export type LayerLineOptions = BasicLayerOptions<
  'line',
  {
    /**
     * - `cover`: Lines are rendered independently and may overlap each other.
     * - `stack`: The lines will be stacked on the value axis.
     */
    mode: 'cover' | 'stack'
  }
>

export type LayerRadarOptions = BasicLayerOptions<
  'radar',
  {
    /**
     * - `cover`: Polygons are rendered independently and may overlap each other.
     * - `stack`: The polygons will be stacked on the value axis.
     */
    mode: 'cover' | 'stack'
  }
>

export type LayerRectOptions = BasicLayerOptions<
  'rect',
  {
    /**
     * - `column`: The rectangles are arranged horizontally and stretched vertically.
     * - `bar`: The rectangles are arranged vertically and stretched horizontally.
     */
    variant: 'column' | 'bar'
    /**
     * - `cover`: Rectangles are rendered independently and may overlap each other.
     * - `group`: Rectangles in the same group will bisect the width.
     * - `stack`: The rectangles will be stacked on the value axis.
     * - `interval`: Use a rectangle to represent a range of values.
     * - `waterfall`: Like stack, but stacks between groups instead of within groups.
     * - `percentage`: Like stack, but in the same group will bisect the height.
     */
    mode: 'cover' | 'group' | 'stack' | 'interval' | 'waterfall' | 'percentage'
    /**
     * Sort rectangles between and within groups.
     */
    sort: 'asc' | 'desc'
  }
>

export type LayerArcOptions = BasicLayerOptions<
  'arc',
  {
    /**
     * - `pie`: The arc radius is the same, the angle changes with the value.
     * - `nightingaleRose`: The arc angle is the same, the radius changes with the value.
     */
    variant: 'pie' | 'nightingaleRose'
  }
>

export type LayerFlopperOptions = BasicLayerOptions<
  'flopper',
  {
    /**
     * - `vertical`: Numbers scroll up and down to update.
     * - `flop`: Numbers fold flip to update.
     */
    variant: 'vertical' | 'flop'
  }
>

export type LayerPackOptions = BasicLayerOptions<
  'pack',
  {
    /**
     * - `pack`: The normal pack chart.
     * - `wordCloud`: Pack chart with only one layer and only text.
     */
    variant: 'pack' | 'wordCloud'
  }
>

export type LayerCarouselOptions = BasicLayerOptions<
  'carousel',
  {
    /**
     * - `slide`: Images swipe up, down, left and right to switch.
     * - `fade`: Images fade in and fade out to switch.
     */
    mode: 'slide' | 'fade'
  }
>
