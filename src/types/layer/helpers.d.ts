import {Layer} from './base'
import {TextStyleShape} from './styles'

export interface CreateTextProps {
  x: number
  y: number
  value?: Meta
  style?: TextStyleShape
  position?: Position9
  offset?: number
}

export interface CreateColorMatrixProps {
  layer: Layer
  row: number
  column: number
  theme: MaybeGroup<string>
  nice?: boolean
}
