import {createEvent, createLog} from '../utils'
import {D3Selection} from './draw'

export type Log = ReturnType<typeof createLog>

export type Event = ReturnType<typeof createEvent>

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

export type Stop = {
  color?: string
  offset?: number
  opacity?: number
}

export type GradientWithId = fabric.Gradient & {
  id?: string
}

export interface GradientCreatorProps<T> {
  container: D3Selection | GradientWithId[]
  engine: Engine
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

export interface BaseRandomOptions {
  row: number
  column: number
  decimals?: number
}

export interface NormalRandomOptions extends BaseRandomOptions {
  mode: 'normal'
  sigma?: number
  mu?: number
}

export interface PoissonRandomOptions extends BaseRandomOptions {
  mode: 'poisson'
  lambda?: number
}

export type RandomOptions = NormalRandomOptions | PoissonRandomOptions
