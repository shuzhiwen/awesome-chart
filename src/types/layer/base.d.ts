import {LayerBase, layerMapping} from '../../layers'
import {LayerOptions} from './options'
import {ColorMatrix} from '../../utils'
import {DrawerTarget, DrawerType, GraphDrawerProps} from '../draw'
import {AnimationType, BasicAnimationOptions} from '../animation'
import {RawScale, ScaleNiceShape} from '../scale'
import {ChartContext} from '../chart'

export type LayerType = keyof typeof layerMapping

export type BackupDataItemShape<T> = Omit<GraphDrawerProps<T>, 'className' | 'container'>[] & {
  renderOrderCache?: Map<Meta, number>
}

export type BackupDataShape<T> = Record<string, BackupDataItemShape<T>>

export type BackupAnimationOptions<T = BasicAnimationOptions> = Record<
  string,
  Partial<Record<'enter' | 'loop' | 'update', T>>
>

export type BackupAnimationShape = Record<string, Maybe<AnyObject>> & {
  timer: Record<string, NodeJS.Timeout>
  options?: BackupAnimationOptions
}

export type LegendShape = 'rect' | 'circle' | 'broken-line' | 'dotted-line' | 'star'

export interface LayerBaseProps<T extends LayerOptions> {
  context: ChartContext
  options: T
  sublayers?: string[]
  tooltipTargets?: string[]
}

export interface CreateAnimationConfigItemShape {
  type: AnimationType
  duration?: number
  delay?: number
  loop?: boolean
}

export interface CreateAnimationProps {
  event: Event
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
  scaleYR?: RawScale
  scaleAngle?: RawScale
  scaleRadius?: RawScale
  scaleColor?: RawScale
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
