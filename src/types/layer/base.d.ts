import {LayerBase, layerMapping} from '../../layers'
import {
  Scale,
  DrawerType,
  ChartContext,
  GraphDrawerProps,
  BasicAnimationOptions,
  ScaleNiceShape,
  LayoutArea,
  AnimationType,
  DrawerTarget,
} from '..'

export type LayerType = keyof typeof layerMapping

export type BackupDataItemShape<T> = Omit<
  GraphDrawerProps<T>,
  'className' | 'container' | 'engine'
>[]

export type BackupDataShape<T> = Record<string, BackupDataItemShape<T>>

export type BackupAnimationOptions = Record<
  string,
  Record<'enter' | 'loop' | 'update', BasicAnimationOptions>
>

export type BackupAnimationShape = Record<string, Maybe<AnyObject>> & {
  timer: Record<string, NodeJS.Timeout>
  options?: BackupAnimationOptions
}

export interface LayerBaseProps<T> {
  context: ChartContext
  options: T & LayerOptions
  tooltipTargets?: string[]
  sublayers?: string[]
}

export type CreateAnimationConfigItemShape = {
  type: AnimationType
  duration?: number
  delay?: number
  loop?: boolean
}

export type CreateAnimationProps = {
  event: Event
  engine: Engine
  sublayer: string
  context: DrawerTarget
  config: Record<
    string,
    {
      enter: CreateAnimationConfigItemShape
      loop: CreateAnimationConfigItemShape
      update: CreateAnimationConfigItemShape
    }
  >
}

export interface DrawBasicProps {
  type: DrawerType
  data: BackupDataItemShape<any>
  sublayer?: string
}

export type LayerOptions = AnyObject & {
  id: string
  layout: LayoutArea
  coordinate?: Coordinate
  axis?: 'main' | 'minor'
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

export type Layer = LayerBase<LayerOptions> & {
  scales?: LayerScalesShape
}
