import {LayoutArea} from '../layout'

export type LayerOptions<T extends AnyObject = AnyObject> = T & {
  id: string
  layout: LayoutArea
  coordinate?: Coordinate
  axis?: 'main' | 'minor'
}

export type LayerLineOptions = LayerOptions<{
  mode?: 'cover' | 'stack'
}>

export type LayerAxisOptions = LayerOptions<{
  coordinate?: Coordinate
}>
