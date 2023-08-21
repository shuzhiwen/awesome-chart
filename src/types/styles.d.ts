import {AnimationOptions} from './animation'
import {ChartTheme} from './core'
import {BasicDrawerProps, ElConfig} from './draw'
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
  transition: Maybe<Partial<AnimationOptions>>
  hidden: boolean
  mapping: (
    config: ElConfig & Pick<BasicDrawerProps<unknown>, 'container' | 'theme'>
  ) => void | Partial<ElConfig>
}>

type TextStyle = GraphStyle &
  Partial<{
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
  }>

type LayerAxisStyle = {
  /**
   * Determines which coordinate system the current chart is.
   * A chart can only have one coordinate system.
   */
  coordinate: Coordinate
  maxScaleXTextNumber: 'auto' | number
  dynamicReserveTextX: boolean
} & Partial<{
  splitLineAxisX: GraphStyle
  splitLineAxisY: GraphStyle
  splitLineAngle: GraphStyle
  splitLineRadius: GraphStyle
  axisLineAxisX: GraphStyle
  axisLineAxisY: GraphStyle
  textX: TextStyle
  textY: TextStyle
  textYR: TextStyle
  textAngle: TextStyle
  textRadius: TextStyle
  titleX: TextStyle
  titleY: TextStyle
  titleYR: TextStyle
}>

type LayerLegendStyle = {
  gap: Vec2
  offset: Vec2
  align: [Alignment, Alignment]
  maxColumn: number
  shapeSize: number
} & Partial<{
  shape: GraphStyle
  text: TextStyle
}>

type LayerAuxiliaryStyle = {
  direction: Direction
  enableLegend: boolean
  labelPosition: Position4
  labelOffset: number
} & Partial<{
  labelBackground: GraphStyle
  line: GraphStyle
  text: TextStyle
}>

type LayerInteractiveStyle = Partial<{
  interactive: GraphStyle
  line: GraphStyle
}>

type LayerBasemapStyle = Partial<{
  block: GraphStyle
  text: TextStyle
}>

type LayerHeatmapStyle = {
  radiusFactor: number
} & Partial<{
  heatZone: GraphStyle
}>

type LayerODLineStyle = Partial<{
  odLine: GraphStyle
  flyingObject: GraphStyle & {
    path: Maybe<string>
  }
}>

type LayerTextStyle = {
  sanger: Vec2
} & Partial<{
  text: Partial<TextStyle & {align: [Alignment, Alignment]}>
  groupText: Partial<TextStyle & {align: [Alignment, Alignment]}>[]
}>

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
} & Partial<{
  text: TextStyle
  curve: GraphStyle
  point: GraphStyle
  area: GraphStyle
}>

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
  labelPosition: Position5 | [Position5, Position5]
  labelPositionOrient: Position2
  fixedWidth: Meta
  fixedHeight: Meta
} & Partial<{
  /**
   * Sort rectangles between and within groups.
   */
  sort: 'asc' | 'desc'
  background: GraphStyle
  rect: GraphStyle
  text: TextStyle
}>

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
} & Partial<{
  arc: GraphStyle
  text: TextStyle
}>

type LayerScatterStyle = {
  pointSize: Vec2
} & Partial<{
  point: GraphStyle
  text: TextStyle
}>

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
} & Partial<{
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
  cell: Partial<{
    fontSize: string
    backgroundColor: string
  }>
}>

type LayerPackStyle = {
  /**
   * - `pack`: The normal pack chart.
   * - `wordCloud`: Pack chart with only one layer and only text.
   */
  variant: 'pack' | 'wordCloud'
  padding: number
  zoom: boolean
} & Partial<{
  circle: GraphStyle
  text: TextStyle
}>

type LayerForceStyle = {
  nodeSize: Vec2
} & Partial<{
  node: GraphStyle
  text: TextStyle
}>

type LayerSankeyStyle = {
  edgeVariant: 'curve' | 'ribbon'
  direction: Direction
  nodeWidth: number
  nodeGap: number
  edgeGap: number
  labelOffset: number
  align: Alignment
} & Partial<{
  node: GraphStyle
  edge: GraphStyle
  text: TextStyle
}>

type LayerTreemapStyle = {
  tile: Tile
  align: [Alignment, Alignment]
  labelGap: number
} & Partial<{
  rect: GraphStyle
  text: TextStyle
}>

type LayerTreeStyle = {
  curveType: Curve
  direction: Direction
  labelOffset: number
  labelPosition: Position2
  align: Alignment
  nodeSize: number
} & Partial<{
  node: GraphStyle
  edge: GraphStyle
  text: TextStyle
}>

type LayerMatrixStyle = {
  shape: 'circle' | 'rect'
  colorDomain: Vec2 | 'auto'
  circleSize: [number | 'auto', number | 'auto']
} & Partial<{
  circle: GraphStyle
  rect: GraphStyle
  text: TextStyle
}>

type LayerRadarStyle = {
  /**
   * - `cover`: Polygons are rendered independently and may overlap each other.
   * - `stack`: The polygons will be stacked on the value axis.
   */
  mode: 'cover' | 'stack'
  pointSize: 6
} & Partial<{
  point: GraphStyle
  polygon: GraphStyle
  text: TextStyle
}>

type LayerDashboardStyle = {
  step: Vec2
  startAngle: number
  endAngle: number
  arcWidth: number
  tickSize: number
} & Partial<{
  arc: GraphStyle
  pointer: GraphStyle
  tickLine: GraphStyle
  tickText: TextStyle
  valueText: TextStyle
  labelText: TextStyle
}>

type LayerMarkStyle = {
  size: number
} & Partial<{
  mark: GraphStyle
  text: TextStyle
}>

type BrushGraphStyle = Omit<GraphStyle, 'mapping'> & {
  rx?: number
  ry?: number
}

type LayerBrushStyle = {
  targets: string[]
  handleZoom: number
  direction: Direction
} & Partial<{
  background: BrushGraphStyle
  selection: BrushGraphStyle
  leftHandle: BrushGraphStyle
  rightHandle: BrushGraphStyle
}>

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
} & Partial<{
  dot: GraphStyle
}>

type LayerRadialStyle = {
  innerRadius: number
  cornerRadius: number
} & Partial<{
  arc: GraphStyle
  text: TextStyle
}>

type LayerWaveStyle = {
  wavelength: number
  amplitude: number
  areaNumber: number
  areaGap: number
} & Partial<{
  area: GraphStyle
  background: GraphStyle
  text: TextStyle
}>

type LayerGridStyle = {
  placeMode: 'collision' | 'position'
  draggable: boolean
  sangerColumn: number
  sangerGap: number
} & Partial<{
  gridLine: GraphStyle
  placeholder: GraphStyle
  box: GraphStyle
}>

type LayerChordStyle = {
  arcWidth: number
  labelOffset: number
} & Partial<{
  edge: GraphStyle
  node: GraphStyle
  text: TextStyle
}>
