import {LayerBase, layerMapping} from '../../layers'
import {
  Scale,
  DrawerType,
  ChartContext,
  GraphDrawerProps,
  ScaleNiceShape,
  LayoutArea,
  AnimationType,
  DrawerTarget,
} from '..'

export type LayerType = keyof typeof layerMapping

export type BackupValueShape<TData> = Omit<
  GraphDrawerProps<TData>,
  'className' | 'container' | 'engine'
>[]

export type BackupShape<TData> = Record<string, BackupValueShape<TData>>

export interface LayerBaseProps {
  context: ChartContext
  options: LayerOptions
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
  data: BackupValueShape<any>
  sublayer?: string
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
