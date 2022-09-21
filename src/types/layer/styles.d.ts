import {BasicAnimationOptions} from '../animation'
import {BasicDrawerProps, CurveType, ElConfigShape} from '../draw'
import {FormatNumberConfig} from '../utils'

export type GraphStyleShape = Partial<{
  fill: MaybeGroup<string>
  stroke: MaybeGroup<string>
  strokeWidth: MaybeGroup<number>
  opacity: MaybeGroup<number>
  fillOpacity: MaybeGroup<number>
  strokeOpacity: MaybeGroup<number>
  strokeDasharray: MaybeGroup<string>
  transformOrigin: MaybeGroup<string>
  rotation: MaybeGroup<number>
  transition: Maybe<Partial<BasicAnimationOptions>>
  hidden: boolean
  mapping: (
    config: ElConfigShape & Pick<BasicDrawerProps<unknown>, 'container' | 'theme'>
  ) => void | Partial<ElConfigShape>
}>

export type TextStyleShape = GraphStyleShape &
  Partial<{
    writingMode: 'horizontal-tb' | 'vertical-rl'
    textDecoration: 'line-through' | 'overline' | 'underline' | 'none'
    fontFamily: MaybeGroup<string>
    fontWeight: MaybeGroup<string | number>
    fontSize: MaybeGroup<number>
    shadow: MaybeGroup<string>
    format: FormatNumberConfig
    offset: [number, number]
  }>

export type LayerAxisStyleShape = Partial<{
  maxScaleXTextNumber: 'auto' | number
  splitLineAxisX: GraphStyleShape
  splitLineAxisY: GraphStyleShape
  splitLineAngle: GraphStyleShape
  splitLineRadius: GraphStyleShape
  axisLineAxisX: GraphStyleShape
  axisLineAxisY: GraphStyleShape
  textX: TextStyleShape
  textY: TextStyleShape
  textYR: TextStyleShape
  textAngle: TextStyleShape
  textRadius: TextStyleShape
  titleX: TextStyleShape
  titleY: TextStyleShape
  titleYR: TextStyleShape
}>

export type LayerLegendStyleShape = Partial<{
  align: Alignment
  verticalAlign: Alignment
  direction: Direction
  offset: [number, number]
  gap: [number, number]
  shapeSize: number
  shape: GraphStyleShape
  text: TextStyleShape
}>

export type LayerAuxiliaryStyleShape = Partial<{
  direction: Direction
  enableLegend: boolean
  labelPosition: Position4
  labelOffset: number
  labelBackground: GraphStyleShape
  line: GraphStyleShape
  text: TextStyleShape
}>

export type LayerInteractiveStyleShape = Partial<{
  interactive: GraphStyleShape
  line: GraphStyleShape
}>

export type LayerBasemapStyleShape = Partial<{
  block: GraphStyleShape
  text: TextStyleShape
}>

export type LayerHeatmapStyleShape = Partial<{
  radiusFactor: number
  heatZone: GraphStyleShape
}>

export type LayerODLineStyleShape = Partial<{
  odLine: GraphStyleShape
  flyingObject: {
    path: Maybe<string>
  }
}>

export type LayerTextStyleShape = Partial<{
  sanger: [number, number]
  text: Partial<
    TextStyleShape & {
      align: Alignment
      verticalAlign: Alignment
    }
  >
  groupText: Partial<
    TextStyleShape & {
      align: Alignment
      verticalAlign: Alignment
    }
  >[]
}>

export type LayerLineStyleShape = Partial<{
  fallback: 'zero' | 'continue' | 'break'
  areaGradient: boolean
  pointSize: number
  labelPosition: Position5
  curveType: CurveType
  text: TextStyleShape
  curve: GraphStyleShape
  point: GraphStyleShape
  area: GraphStyleShape
}>

export type LayerRectStyleShape = Partial<{
  fixedWidth: Maybe<number>
  fixedHeight: Maybe<number>
  labelPosition: Position5 | [Position5, Position5]
  labelPositionOrient: Position2
  rect: GraphStyleShape
  background: GraphStyleShape
  text: TextStyleShape
}>

export type LayerArcStyleShape = Partial<{
  innerRadius: number
  labelOffset: number
  labelPosition: Position2
  arc: GraphStyleShape
  text: TextStyleShape
}>

export type LayerScatterStyleShape = Partial<{
  pointSize: [number, number]
  point: GraphStyleShape
  text: TextStyleShape
}>

export type LayerFlopperStyleShape = Partial<{
  scale: number
  integerPlace: number
  decimalPlace: number
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
  cell: {
    fontSize: string
    backgroundColor: string
  }
}>

export type LayerPackStyleShape = Partial<{
  zoom: boolean
  padding: number
  circle: GraphStyleShape
  text: TextStyleShape
}>

export type LayerForceStyleShape = Partial<{
  nodeSize: [number, number]
  node: GraphStyleShape
  text: TextStyleShape
}>

export type LayerSankeyStyleShape = Partial<{
  edgeVariant: 'curve' | 'ribbon'
  direction: Direction
  nodeWidth: number
  nodeGap: number
  edgeGap: number
  labelOffset: number
  align: Alignment
  node: GraphStyleShape
  edge: GraphStyleShape
  text: TextStyleShape
}>

export type LayerTreemapStyleShape = Partial<{
  title: 'treemapBinary' | 'treemapDice' | 'treemapSlice' | 'treemapSliceDice' | 'treemapSquarify'
  align: Alignment
  verticalAlign: Alignment
  labelGap: number
  rect: GraphStyleShape
  text: TextStyleShape
}>

export type LayerTreeStyleShape = Partial<{
  curveType: CurveType
  direction: Direction
  labelOffset: number
  labelPosition: Position2
  align: Alignment
  nodeSize: number
  node: GraphStyleShape
  edge: GraphStyleShape
  text: TextStyleShape
}>

export type LayerMatrixStyleShape = Partial<{
  shape: 'circle' | 'rect'
  colorDomain: [number, number] | 'auto'
  circleSize: [number | 'auto', number | 'auto']
  circle: GraphStyleShape
  rect: GraphStyleShape
  text: TextStyleShape
}>

export type LayerRadarStyleShape = Partial<{
  pointSize: 6
  point: GraphStyleShape
  polygon: GraphStyleShape
  text: TextStyleShape
}>

export type LayerDashboardStyleShape = Partial<{
  step: [number, number]
  startAngle: number
  endAngle: number
  arcWidth: number
  arc: GraphStyleShape
  tickSize: number
  pointer: GraphStyleShape
  tickLine: GraphStyleShape
  tickText: TextStyleShape
  valueText: TextStyleShape
  labelText: TextStyleShape
}>

export type LayerMarkStyleShape = Partial<{
  size: number
  mark: GraphStyleShape
  text: TextStyleShape
}>

type BrushGraphStyleShape = Omit<GraphStyleShape, 'mapping'> & {
  rx?: number
  ry?: number
}

export type LayerBrushStyleShape = Partial<{
  targets: string[]
  handleZoom: number
  direction: Direction
  background: BrushGraphStyleShape
  selection: BrushGraphStyleShape
  leftHandle: BrushGraphStyleShape
  rightHandle: BrushGraphStyleShape
}>

export type LayerCandleStyleShape = Partial<{
  positiveColor: string
  negativeColor: string
  rect: LayerRectStyleShape
  line: LayerRectStyleShape
}>

export type LayerCarouselStyleShape = Partial<{
  direction: Position4
  padding: number
  zoom: number
  dot: GraphStyleShape
  maxDotSize: number
}>

export type LayerRadialStyleShape = Partial<{
  innerRadius: number
  cornerRadius: number
  arc: GraphStyleShape
  text: TextStyleShape
}>

export type LayerWaveStyleShape = Partial<{
  wavelength: number
  amplitude: number
  areaNumber: number
  areaGap: number
  area: GraphStyleShape
  background: GraphStyleShape
  text: TextStyleShape
}>
