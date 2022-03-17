import {LayerBase, layerMapping} from '../../layers'
import {
  Scale,
  DrawerType,
  ChartContext,
  GraphDrawerProps,
  BasicAnimationOptions,
  ScaleNiceShape,
  AnimationType,
  DrawerTarget,
} from '..'
import {LayerOptions} from './options'
import {ColorMatrix} from '../../utils'
import {Meta} from '../data'

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

export interface CreateAnimationProps {
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

export type LegendDataShape = {
  colorMatrix?: ColorMatrix
  filter?: 'column' | 'row'
  legends?: {
    label: Meta
    color: string
    shape: 'rect' | 'circle' | 'broken-line' | 'dotted-line' | 'star'
  }[]
}
