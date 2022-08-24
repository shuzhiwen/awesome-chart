import {Layer} from './base'
import {TextStyleShape} from './styles'

export type CreateTextProps = {
  x: number
  y: number
  value: Maybe<Meta>
  style?: TextStyleShape
  position?: Position9
  offset?: number
}

export type CreateLimitTextProps = CreateTextProps & {
  maxTextWidth: number
}

export type CreateColorMatrixProps = {
  layer: Layer
  row: number
  column: number
  theme: MaybeGroup<string>
  nice?: boolean
}
