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

export type LayerTextStyleShape = {
  align?: Align
  verticalAlign?: Align
  text?: TextStyleShape
}

export type LayerLineStyleShape = {
  fallback: 'zero' | 'continue' | 'break'
  pointSize: number
  labelPosition: Position5
  curveType: CurveType
  text?: TextStyleShape
  curve?: GraphStyleShape
  point?: GraphStyleShape
  area?: GraphStyleShape
}
