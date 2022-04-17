import {CurveType} from '../draw'
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
  enableUpdateAnimation: boolean
  updateAnimationDuration: number
  updateAnimationDelay: number
  mapping: (config: AnyObject) => AnyObject
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
  lineAxisX: GraphStyleShape
  lineAxisY: GraphStyleShape
  lineAngle: GraphStyleShape
  lineRadius: GraphStyleShape
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
  align: Align
  verticalAlign: Align
  direction: Direction
  offset: [number, number]
  gap: [number, number]
  shapeSize: number
  shape: GraphStyleShape
  text: TextStyleShape
}>

export type LayerAuxiliaryStyleShape = Partial<{
  enableLegend: boolean
  labelPosition: Position4
  labelOffset: number
  line: GraphStyleShape
  text: TextStyleShape
}>

export type LayerInteractiveStyleShape = Partial<{
  interactive: GraphStyleShape
  line: GraphStyleShape
}>

export type LayerTextStyleShape = Partial<{
  align: Align
  verticalAlign: Align
  text: TextStyleShape
}>

export type LayerLineStyleShape = Partial<{
  fallback: 'zero' | 'continue' | 'break'
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
