import {LayerBase, layerMapping} from '../../layers'
import {LayerOptions} from './options'
import {ColorMatrix} from '../../utils'
import {DrawerTarget, DrawerType, GraphDrawerProps} from '../draw'
import {AnimationType, BasicAnimationOptions} from '../animation'
import {Scale, ScaleNiceShape} from '../scale'
import {ChartContext} from '../chart'

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

export interface DrawBasicProps<T> {
  type: DrawerType
  data: BackupDataItemShape<T>
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
  scale?: LayerScalesShape
  legendData?: Maybe<LegendDataShape>
}

export type LegendShape = 'rect' | 'circle' | 'broken-line' | 'dotted-line' | 'star'

export type LegendDataShape = {
  filter: 'column' | 'row'
  colorMatrix: ColorMatrix
  legends: {
    label: Meta
    color: string
    shape: LegendShape
  }[]
}
