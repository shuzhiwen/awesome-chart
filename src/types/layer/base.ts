import {TextStyleShape} from '.'
import {LayerBase, layerMapping} from '../../layers'
import {
  Meta,
  Scale,
  DrawerType,
  ChartContext,
  GraphDrawerProps,
  ScaleNiceShape,
  LayoutArea,
} from '..'

export type LayerType = keyof typeof layerMapping

export type BackupValueShape<TData> = (Omit<
  GraphDrawerProps<TData>,
  'className' | 'container' | 'engine'
> & {
  hide?: boolean
})[]

export type BackupShape<TData> = Record<string, BackupValueShape<TData>>

export interface LayerBaseProps {
  context: ChartContext
  options: LayerOptions
  tooltipTargets?: string[]
  sublayers?: string[]
}

export interface DrawBasicProps {
  type: DrawerType
  data: BackupValueShape<any>
  sublayer?: string
}

export interface CreateTextProps {
  x: number
  y: number
  value: Meta
  style?: TextStyleShape
  position?: Position
  offset?: number
}

export type LayerOptions = AnyObject & {
  id: string
  layout: LayoutArea
}

export type LayerScalesShape = {
  scaleX?: Scale
  scaleY?: Scale
  scaleXT?: Scale
  scaleYR?: Scale
  scaleAngle?: Scale
  scaleRadius?: Scale
  nice?: ScaleNiceShape
}

export type Layer = LayerBase & {
  scales?: LayerScalesShape
}
