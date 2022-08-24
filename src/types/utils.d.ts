import {D3Selection} from './draw'

export type FormatNumberConfig = Partial<{
  percentage: boolean // 0.1234 => 12.34%
  thousandth: boolean // 1234 => 1,234
  decimals: number // 12.3412312 => 12.34
}>

export type OverflowControlConfig = Partial<{
  omit: boolean // add '...' or not
  width: number // max display width
  height: number // max display height
  fontSize: number
}>

export type Stop = Partial<{
  color: string
  offset: number
  opacity: number
}>

export type GradientWithId = fabric.Gradient & {
  id?: string
}

export type GradientCreatorProps<T> = {
  container: D3Selection | GradientWithId[]
  schema: T
}

export type EasyGradientCreatorProps = {
  type: 'linear' | 'radial'
  direction: 'horizontal' | 'vertical'
  colors: string[]
}

export type LinearGradientSchema = {
  id: string
  x1?: number
  y1?: number
  x2?: number
  y2?: number
  stops: Stop[]
}

export type RadialGradientSchema = {
  id: string
  r?: number
  r2?: number
  x1?: number
  y1?: number
  x2?: number
  y2?: number
  stops: Stop[]
}

export type CreateDefsSchema = Partial<{
  linearGradient?: MaybeGroup<LinearGradientSchema>
  radialGradient?: MaybeGroup<RadialGradientSchema>
}>

export type RandomOptions = {
  mode: 'normal' | 'poisson'
  row: number
  column: number
  decimals?: number
  lambda?: number
  sigma?: number
  mu?: number
}
