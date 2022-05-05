import {LayoutArea} from '../layout'
import {LayerType} from './base'

type BasicLayerOptions<
  T extends LayerType,
  P extends AnyObject = AnyObject<unknown>
> = Partial<P> & {
  id: string
  type: T
  layout: LayoutArea
  coordinate?: Coordinate
  axis?: 'main' | 'minor'
}

export type LayerOptions =
  | LayerAxisOptions
  | LayerAuxiliaryOptions
  | LayerLineOptions
  | LayerRectOptions
  | LayerArcOptions
  | LayerFlopperOptions
  | LayerTextOptions
  | LayerInteractiveOptions
  | LayerLegendOptions

export type LayerInteractiveOptions = BasicLayerOptions<'interactive'>

export type LayerLegendOptions = BasicLayerOptions<'legend'>

export type LayerTextOptions = BasicLayerOptions<'text'>

export type LayerAxisOptions = BasicLayerOptions<
  'axis',
  {
    coordinate: Coordinate
  }
>

export type LayerAuxiliaryOptions = BasicLayerOptions<
  'auxiliary',
  {
    direction: Direction
  }
>

export type LayerLineOptions = BasicLayerOptions<
  'line',
  {
    mode: 'cover' | 'stack'
  }
>

export type LayerRectOptions = BasicLayerOptions<
  'rect',
  {
    variant: 'column' | 'bar'
    mode: 'cover' | 'group' | 'stack' | 'interval' | 'waterfall' | 'percentage'
  }
>

export type LayerArcOptions = BasicLayerOptions<
  'arc',
  {
    variant: 'pie' | 'nightingaleRose'
  }
>

export type LayerFlopperOptions = BasicLayerOptions<
  'flopper',
  {
    mode: 'vertical' | 'flop'
    autoplay: boolean
  }
>
