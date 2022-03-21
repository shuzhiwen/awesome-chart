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
