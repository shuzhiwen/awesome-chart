import {Meta, Layer, TextStyleShape} from '..'

export interface CreateTextProps {
  x: number
  y: number
  value: Meta
  style?: TextStyleShape
  position?: Position9
  offset?: number
}

export type CreateColorMatrixProps = {
  layer: Layer
  row: number
  column: number
  theme: string[]
  nice: boolean
}
