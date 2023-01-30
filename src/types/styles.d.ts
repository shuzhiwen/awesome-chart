import {AnimationOptions} from './animation'
import {BasicDrawerProps, ElConfig} from './draw'
import {FormatNumberConfig} from './utils'
import {ChartTheme} from './core'

export type LayerStyle<T> = Computable<Partial<T>, ChartTheme>

export type GraphStyle = Partial<{
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

export type TextStyle = GraphStyle &
  Partial<{
    writingMode: 'horizontal-tb' | 'vertical-rl'
    textDecoration: 'line-through' | 'overline' | 'underline' | 'none'
    fontFamily: MaybeGroup<string>
    fontWeight: MaybeGroup<string>
    fontSize: MaybeGroup<number>
    shadow: MaybeGroup<string>
    format: FormatNumberConfig
    offset: Vec2
  }>

export type LayerAxisStyle = Partial<{
  maxScaleXTextNumber: 'auto' | number
  dynamicReserveTextX: boolean
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

export type LayerLegendStyle = Partial<{
  maxColumn: number
  align: [Alignment, Alignment]
  offset: Vec2
  gap: Vec2
  shapeSize: number
  shape: GraphStyle
  text: TextStyle
}>

export type LayerAuxiliaryStyle = Partial<{
  direction: Direction
  enableLegend: boolean
  labelPosition: Position4
  labelOffset: number
  labelBackground: GraphStyle
  line: GraphStyle
  text: TextStyle
}>

export type LayerInteractiveStyle = Partial<{
  interactive: GraphStyle
  line: GraphStyle
}>

export type LayerBasemapStyle = Partial<{
  block: GraphStyle
  text: TextStyle
}>

export type LayerHeatmapStyle = Partial<{
  radiusFactor: number
  heatZone: GraphStyle
}>

export type LayerODLineStyle = Partial<{
  odLine: GraphStyle
  flyingObject: GraphStyle & {
    path: Maybe<string>
  }
}>

export type LayerTextStyle = Partial<{
  sanger: Vec2
  text: Partial<TextStyle & {align: [Alignment, Alignment]}>
  groupText: Partial<TextStyle & {align: [Alignment, Alignment]}>[]
}>

export type LayerLineStyle = Partial<{
  fallback: 'zero' | 'continue' | 'break'
  pointSize: number
  labelPosition: Position5
  curveType: Curve
  text: TextStyle
  curve: GraphStyle
  point: GraphStyle
  area: GraphStyle
}>

export type LayerRectStyle = Partial<{
  fixedWidth: Meta
  fixedHeight: Meta
  labelPosition: Position5 | [Position5, Position5]
  labelPositionOrient: Position2
  rect: GraphStyle
  background: GraphStyle
  text: TextStyle
}>

export type LayerArcStyle = Partial<{
  innerRadius: number
  labelOffset: number
  guideLine: GraphStyle
  labelPosition: Position2
  arc: GraphStyle
  text: TextStyle
}>

export type LayerScatterStyle = Partial<{
  pointSize: Vec2
  point: GraphStyle
  text: TextStyle
}>

export type LayerFlopperStyle = Partial<{
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
  cell: Partial<{
    fontSize: string
    backgroundColor: string
  }>
}>

export type LayerPackStyle = Partial<{
  zoom: boolean
  padding: number
  circle: GraphStyle
  text: TextStyle
}>

export type LayerForceStyle = Partial<{
  nodeSize: Vec2
  node: GraphStyle
  text: TextStyle
}>

export type LayerSankeyStyle = Partial<{
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
}>

export type LayerTreemapStyle = Partial<{
  tile: Tile
  align: [Alignment, Alignment]
  labelGap: number
  rect: GraphStyle
  text: TextStyle
}>

export type LayerTreeStyle = Partial<{
  curveType: Curve
  direction: Direction
  labelOffset: number
  labelPosition: Position2
  align: Alignment
  nodeSize: number
  node: GraphStyle
  edge: GraphStyle
  text: TextStyle
}>

export type LayerMatrixStyle = Partial<{
  shape: 'circle' | 'rect'
  colorDomain: Vec2 | 'auto'
  circleSize: [number | 'auto', number | 'auto']
  circle: GraphStyle
  rect: GraphStyle
  text: TextStyle
}>

export type LayerRadarStyle = Partial<{
  pointSize: 6
  point: GraphStyle
  polygon: GraphStyle
  text: TextStyle
}>

export type LayerDashboardStyle = Partial<{
  step: Vec2
  startAngle: number
  endAngle: number
  arcWidth: number
  arc: GraphStyle
  tickSize: number
  pointer: GraphStyle
  tickLine: GraphStyle
  tickText: TextStyle
  valueText: TextStyle
  labelText: TextStyle
}>

export type LayerMarkStyle = Partial<{
  size: number
  mark: GraphStyle
  text: TextStyle
}>

type BrushGraphStyle = Omit<GraphStyle, 'mapping'> & {
  rx?: number
  ry?: number
}

export type LayerBrushStyle = Partial<{
  targets: string[]
  handleZoom: number
  direction: Direction
  background: BrushGraphStyle
  selection: BrushGraphStyle
  leftHandle: BrushGraphStyle
  rightHandle: BrushGraphStyle
}>

export type LayerCandleStyle = Partial<{
  positiveColor: string
  negativeColor: string
  rect: LayerRectStyle
  line: LayerRectStyle
}>

export type LayerCarouselStyle = Partial<{
  direction: Position4
  padding: number
  zoom: number
  dot: GraphStyle
  maxDotSize: number
}>

export type LayerRadialStyle = Partial<{
  innerRadius: number
  cornerRadius: number
  arc: GraphStyle
  text: TextStyle
}>

export type LayerWaveStyle = Partial<{
  wavelength: number
  amplitude: number
  areaNumber: number
  areaGap: number
  area: GraphStyle
  background: GraphStyle
  text: TextStyle
}>

export type LayerGridStyle = Partial<{
  placeMode: 'collision' | 'position'
  draggable: boolean
  sangerColumn: number
  sangerGap: number
  gridLine: GraphStyle
  placeholder: GraphStyle
  box: GraphStyle
}>

export type LayerChordStyle = Partial<{
  arcWidth: number
  labelOffset: number
  edge: GraphStyle
  node: GraphStyle
  text: TextStyle
}>
