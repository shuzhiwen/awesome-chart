import {CSSProperties} from 'react'
import {ChartTheme} from './core'
import {BasicDrawerProps, ElConfig} from './draw'
import {LayerScale} from './layer'
import {FormatNumberConfig} from './utils'

type LayerStyle<T> = Computable<Partial<T>, ChartTheme>

type GraphStyle = Partial<{
  fill: MaybeGroup<string>
  stroke: MaybeGroup<string>
  strokeWidth: MaybeGroup<number>
  opacity: MaybeGroup<number>
  fillOpacity: MaybeGroup<number>
  strokeOpacity: MaybeGroup<number>
  strokeDasharray: MaybeGroup<string>
  rotation: MaybeGroup<number>
  hidden: boolean
  mapping: (
    config: ElConfig & Pick<BasicDrawerProps<unknown>, 'container' | 'theme'>
  ) => void | Partial<ElConfig>
}>

type TextStyle = Partial<
  GraphStyle & {
    writingMode: 'horizontal-tb' | 'vertical-rl'
    textDecoration: MaybeGroup<
      'line-through' | 'overline' | 'underline' | 'none'
    >
    fontFamily: MaybeGroup<string>
    fontWeight: MaybeGroup<string>
    fontSize: MaybeGroup<number>
    shadow: MaybeGroup<string>
    format: FormatNumberConfig
    offset: Vec2
  }
>

type LayerAxisStyle = {
  /**
   * Determines which coordinate system the current chart is.
   * A chart can only have one coordinate system.
   */
  coordinate: Coordinate
  maxScaleXTextNumber: 'auto' | number
  dynamicReserveTextX: boolean
  axisLineX: GraphStyle
  axisLineY: GraphStyle
  splitLineX: GraphStyle
  splitLineY: GraphStyle
  splitLineAngle: GraphStyle
  splitLineRadius: GraphStyle
  textX: TextStyle
  textY: TextStyle
  textYR: TextStyle
  textAngle: TextStyle
  textRadius: TextStyle
  titleX: TextStyle
  titleY: TextStyle
  titleYR: TextStyle
}

type LayerLegendStyle = {
  gap: Vec2
  offset: Vec2
  align: Vec2<Alignment>
  maxColumn: number
  shapeSize: number
  shape: GraphStyle
  text: TextStyle
}

type LayerAuxiliaryStyle = {
  direction: Direction
  enableLegend: boolean
  labelPosition: Position4
  labelOffset: number
  labelBackground: GraphStyle
  line: GraphStyle
  text: TextStyle
}

type LayerInteractiveStyle = {
  interactive: GraphStyle
  line: GraphStyle
}

type LayerBasemapStyle = {
  block: GraphStyle
  text: TextStyle
}

type LayerHeatmapStyle = {
  radiusFactor: number
  heatZone: GraphStyle
}

type LayerODLineStyle = {
  odLine: GraphStyle
  flyingObject: GraphStyle & {
    path: Maybe<string>
  }
}

type LayerTextStyle = {
  sanger: Vec2
  text: Partial<TextStyle & {align: Vec2<Alignment>}>
  groupText: Partial<TextStyle & {align: Vec2<Alignment>}>[]
}

type LayerLineStyle = {
  /**
   * - `cover`: Lines are rendered independently and may overlap each other.
   * - `stack`: The lines will be stacked on the value axis.
   */
  mode: 'cover' | 'stack'
  fallback: 'zero' | 'continue' | 'break'
  labelPosition: Position5
  pointSize: number
  curveType: Curve
  text: TextStyle
  curve: GraphStyle
  point: GraphStyle
  area: GraphStyle
}

type LayerRectStyle = {
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
  sort: 'asc' | 'desc' | 'none'
  /**
   * Label display that determines positive and negative values.
   */
  labelPosition: Vec2<Position5> | Position5
  labelPositionOrient: Position2
  fixedWidth: Meta
  fixedHeight: Meta
  background: GraphStyle
  rect: GraphStyle
  text: TextStyle
}

type LayerArcStyle = {
  /**
   * - `pie`: The arc radius is the same, the angle changes with the value.
   * - `nightingaleRose`: The arc angle is the same, the radius changes with the value.
   */
  variant: 'pie' | 'nightingaleRose'
  innerRadius: number
  labelOffset: number
  guideLine: GraphStyle
  labelPosition: Position2
  arc: GraphStyle
  text: TextStyle
}

type LayerScatterStyle = {
  pointSize: Vec2
  point: GraphStyle
  text: TextStyle
}

type LayerFlopperStyle = {
  /**
   * - `vertical`: Numbers scroll up and down to update.
   * - `flop`: Numbers fold flip to update.
   */
  variant: 'vertical' | 'flop'
  scale: number
  integers: number
  decimals: number
  thousandth: boolean
  url: string
  characters: Record<
    string,
    {
      left: number
      top: number
      width: number
      height: number
    }
  >
  cell: Partial<CSSProperties>
}

type LayerPackStyle = {
  /**
   * - `pack`: The normal pack chart.
   * - `wordCloud`: Pack chart with only one layer and only text.
   */
  variant: 'pack' | 'wordCloud'
  padding: number
  zoom: boolean
  circle: GraphStyle
  text: TextStyle
}

type LayerForceStyle = {
  nodeSize: Vec2
  node: GraphStyle
  text: TextStyle
}

type LayerSankeyStyle = {
  edgeVariant: 'curve' | 'ribbon'
  direction: Direction
  nodeWidth: number
  nodeGap: number
  edgeGap: number
  labelOffset: number
  align: Alignment
  node: GraphStyle
  edge: GraphStyle
  text: TextStyle
}

type LayerTreemapStyle = {
  tile: Tile
  align: Vec2<Alignment>
  labelGap: number
  rect: GraphStyle
  text: TextStyle
}

type LayerTreeStyle = {
  curveType: Curve
  direction: Direction
  labelOffset: number
  labelPosition: Position2
  align: Alignment
  nodeSize: number
  node: GraphStyle
  edge: GraphStyle
  text: TextStyle
}

type LayerMatrixStyle = {
  shape: 'circle' | 'rect'
  colorDomain: Vec2 | 'auto'
  circleSize: Vec2<number | 'auto'>
  circle: GraphStyle
  rect: GraphStyle
  text: TextStyle
}

type LayerRadarStyle = {
  /**
   * - `cover`: Polygons are rendered independently and may overlap each other.
   * - `stack`: The polygons will be stacked on the value axis.
   */
  mode: 'cover' | 'stack'
  pointSize: 6
  point: GraphStyle
  polygon: GraphStyle
  text: TextStyle
}

type LayerDashboardStyle = {
  step: Vec2
  startAngle: number
  endAngle: number
  arcWidth: number
  tickSize: number
  arc: GraphStyle
  pointer: GraphStyle
  tickLine: GraphStyle
  tickText: TextStyle
  valueText: TextStyle
  labelText: TextStyle
}

type LayerMarkStyle = {
  size: number
  mark: GraphStyle
  text: TextStyle
}

type BrushGraphStyle = Omit<GraphStyle, 'mapping'> & {
  rx?: number
  ry?: number
}

type LayerBrushStyle = {
  targets: Keys<Omit<LayerScale, 'nice'>>[]
  handleZoom: number
  direction: Direction
  debounce: number
  background: BrushGraphStyle
  selection: BrushGraphStyle
  handle: BrushGraphStyle
}

type LayerCandleStyle = {
  positiveColor: string
  negativeColor: string
  rect: Partial<LayerRectStyle>
  line: Partial<LayerRectStyle>
}

type LayerCarouselStyle = {
  /**
   * - `slide`: Images swipe up, down, left and right to switch.
   * - `fade`: Images fade in and fade out to switch.
   */
  mode: 'slide' | 'fade'
  direction: Position4
  maxDotSize: number
  padding: number
  zoom: number
  dot: GraphStyle
}

type LayerRadialStyle = {
  innerRadius: number
  cornerRadius: number
  arc: GraphStyle
  text: TextStyle
}

type LayerWaveStyle = {
  wavelength: number
  amplitude: number
  areaNumber: number
  areaGap: number
  area: GraphStyle
  background: GraphStyle
  text: TextStyle
}

type LayerGridStyle = {
  placeMode: 'collision' | 'position'
  draggable: boolean
  sangerColumn: number
  sangerGap: number
  gridLine: GraphStyle
  placeholder: GraphStyle
  box: GraphStyle
}

type LayerChordStyle = {
  arcWidth: number
  labelOffset: number
  edge: GraphStyle
  node: GraphStyle
  text: TextStyle
}
