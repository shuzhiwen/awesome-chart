import {D3Selection} from './draw'

export interface FormatNumberConfig {
  percentage?: boolean // 0.1234 or 12.34%
  thousandth?: boolean // 1234 or 1,234
  decimals?: number // 12.3 or 12.34
}

export interface OverflowControlConfig {
  omit?: boolean // add '...' or not
  width?: number // max display width
  height?: number // max display height
  fontSize?: number
}

export interface Stop {
  color?: string
  offset?: number
  opacity?: number
}

export interface GradientWithId extends fabric.Gradient {
  id?: string
}

export interface GradientCreatorProps<T> {
  container: D3Selection | GradientWithId[]
  schema: T
}

export interface EasyGradientCreatorProps {
  type: 'linear' | 'radial'
  direction: 'horizontal' | 'vertical'
  colors: string[]
}

export interface LinearGradientSchema {
  id: string
  x1?: number
  y1?: number
  x2?: number
  y2?: number
  stops: Stop[]
}

export interface RadialGradientSchema {
  id: string
  r?: number
  r2?: number
  x1?: number
  y1?: number
  x2?: number
  y2?: number
  stops: Stop[]
}

export interface CreateDefsSchema {
  linearGradient?: MaybeGroup<LinearGradientSchema>
  radialGradient?: MaybeGroup<RadialGradientSchema>
}

export interface RandomOptions {
  mode: 'normal' | 'poisson'
  row: number
  column: number
  decimals?: number
  lambda?: number
  sigma?: number
  mu?: number
}
