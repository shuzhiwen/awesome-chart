import {LayoutArea} from '../layout'

export type LayerOptions<T extends AnyObject = AnyObject> = T & {
  id: string
  layout: LayoutArea
  coordinate?: Coordinate
  axis?: 'main' | 'minor'
}

export type LayerAxisOptions = LayerOptions<{
  coordinate?: Coordinate
}>

export type LayerLineOptions = LayerOptions<{
  mode?: 'cover' | 'stack'
}>

export type LayerRectOptions = LayerOptions<{
  variant?: 'column' | 'bar'
  mode?: 'cover' | 'group' | 'stack' | 'interval' | 'waterfall' | 'percentage'
}>

export type LayerFlopperOptions = LayerOptions<{
  mode?: 'vertical' | 'flop'
}>
