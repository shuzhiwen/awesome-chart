import {Layer} from './base'
import {TextStyleShape} from './styles'

export interface CreateTextProps {
  x: number
  y: number
  value: Maybe<Meta>
  style?: TextStyleShape
  position?: Position9
  offset?: number
}

export interface CreateLimitTextProps extends CreateTextProps {
  maxTextWidth: number
}

export interface CreateColorMatrixProps {
  layer: Layer
  row: number
  column: number
  theme: MaybeGroup<string>
  nice?: boolean
}
