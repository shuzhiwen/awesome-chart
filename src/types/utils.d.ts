import {D3Selection, Meta} from '.'
import {createEvent, createLog} from '../utils'

export type Log = ReturnType<typeof createLog>

export type Event = ReturnType<typeof createEvent>

export interface FormatNumberConfig {
  percentage?: boolean // 0.1234 or 12.34%
  thousandth?: boolean // 1234 or 1,234
  decimalPlace?: number // 12.3 or 12.34
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

export interface MaskSchema {
  type: 'rect' | 'circle' | 'arc'
  id: string
  fill: string

  x?: Meta
  y?: Meta
  width?: Meta
  height?: Meta

  cx?: Meta
  cy?: Meta
  rx?: Meta
  ry?: Meta

  innerRadius?: number
  outerRadius?: number
  startAngle?: number
  endAngle?: number
}

export interface CreateDefsSchema {
  linearGradient?: LinearGradientSchema[] | false
  radialGradient?: RadialGradientSchema[] | false
  mask?: MaskSchema[] | false
}
