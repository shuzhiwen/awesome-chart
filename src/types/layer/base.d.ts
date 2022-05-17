import {LayerBase, layerMapping} from '../../layers'
import {LayerOptions} from './options'
import {ColorMatrix} from '../../utils'
import {DrawerTarget, DrawerType, GraphDrawerProps} from '../draw'
import {AnimationType, BasicAnimationOptions} from '../animation'
import {RawScale, ScaleNiceShape} from '../scale'
import {ChartContext} from '../chart'

export type LayerType = keyof typeof layerMapping

export type BackupDataItemShape<T> = Omit<
  GraphDrawerProps<T>,
  'className' | 'container' | 'engine'
>[]

export type BackupDataShape<T> = Record<string, BackupDataItemShape<T>>

export type BackupAnimationOptions = Record<
  string,
  Partial<Record<'enter' | 'loop' | 'update', AnyObject & BasicAnimationOptions>>
>

export type BackupAnimationShape = Record<string, Maybe<AnyObject>> & {
  timer: Record<string, NodeJS.Timeout>
  options?: BackupAnimationOptions
}

export type LegendShape = 'rect' | 'circle' | 'broken-line' | 'dotted-line' | 'star'

export interface LayerBaseProps<T extends LayerOptions> {
  context: ChartContext
  options: T
  tooltipTargets?: string[]
  sublayers?: string[]
}

export interface CreateAnimationConfigItemShape {
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

export interface LayerScalesShape {
  scaleX?: RawScale
  scaleY?: RawScale
  scaleXT?: RawScale
  scaleYR?: RawScale
  scaleAngle?: RawScale
  scaleRadius?: RawScale
  nice?: ScaleNiceShape
}

export interface Layer extends LayerBase<LayerOptions> {
  scale?: Maybe<LayerScalesShape>
  legendData?: Maybe<LegendDataShape>
}

export interface LegendDataShape {
  filter: 'column' | 'row'
  colorMatrix: ColorMatrix
  legends: {
    label: Meta
    color: string
    shape: LegendShape
  }[]
}
