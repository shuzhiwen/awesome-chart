import {FormatNumberConfig} from '..'

export type GraphStyleShape = Partial<{
  // visual
  fill: MaybeGroup<string>
  stroke: MaybeGroup<string>
  strokeWidth: MaybeGroup<number>
  opacity: MaybeGroup<number>
  fillOpacity: MaybeGroup<number>
  strokeOpacity: MaybeGroup<number>
  transformOrigin: MaybeGroup<string | number>
  rotation: MaybeGroup<number>
  // animation
  enableUpdateAnimation: boolean
  updateAnimationDuration: number
  updateAnimationDelay: number
  // advance
  mapping: (config: AnyObject) => AnyObject
}>

export type TextStyleShape = GraphStyleShape &
  Partial<{
    fontFamily: MaybeGroup<string>
    fontWeight: MaybeGroup<string | number>
    fontSize: MaybeGroup<number>
    writingMode: 'horizontal' | 'vertical'
    format: FormatNumberConfig
    offset: [number, number]
    shadow: MaybeGroup<
      | string
      | {
          color: string
          offset: [number, number]
          blur: number
          hide: boolean
        }
    >
  }>

export type TextLayerStyleShape = {
  align?: Align
  verticalAlign?: Align
  text?: TextStyleShape
}
