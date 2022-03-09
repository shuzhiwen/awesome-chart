import {FormatNumberConfig} from '..'

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

export type TextLayerStyleShape = {
  align?: Align
  verticalAlign?: Align
  text?: TextStyleShape
}
