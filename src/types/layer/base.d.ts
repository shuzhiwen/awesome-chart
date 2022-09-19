import {LayerBase, layerMapping} from '../../layers'
import {LayerOptions} from './options'
import {ColorMatrix} from '../../utils'
import {DrawerType, GraphDrawerProps} from '../draw'
import {BasicAnimationOptions} from '../animation'
import {RawScale, ScaleNiceShape} from '../scale'
import {ChartContext} from '../core'

export type LayerType = keyof typeof layerMapping

export type LegendShape = 'rect' | 'circle' | 'brokenLine' | 'dottedLine' | 'star'

export type BackupDataItemShape<T> = {
  renderOrderCache?: Map<Meta, number>
} & Omit<GraphDrawerProps<T>, 'className' | 'container' | 'theme'>[]

export type BackupDataShape<T> = Record<string, BackupDataItemShape<T>>

export type BackupAnimationOptions<T = BasicAnimationOptions> = Partial<
  Record<string, Partial<Record<'enter' | 'loop' | 'update', T>>>
>

export type BackupAnimationShape = Record<string, Maybe<AnyObject>> & {
  timer: Record<string, NodeJS.Timeout>
  options?: BackupAnimationOptions
}

export type BackupEventShape = {
  common: Record<string, Record<string, AnyFunction>>
  tooltip: Record<string, AnyFunction>
}

export type LayerBaseProps<T extends LayerOptions> = {
  context: ChartContext
  options: T
  sublayers?: string[]
  tooltipTargets?: string[]
}

export type DrawBasicProps<T> = {
  type: DrawerType
  data: BackupDataItemShape<T>
  sublayer?: string
}

export type LayerScalesShape = Partial<{
  scaleX: RawScale
  scaleY: RawScale
  scaleYR: RawScale
  scaleAngle: RawScale
  scaleRadius: RawScale
  scaleColor: RawScale
  nice: ScaleNiceShape
}>

export type LayerInstance = LayerBase<LayerOptions> & {
  scale?: Maybe<LayerScalesShape>
  legendData?: Maybe<LegendDataShape>
}

export type LegendDataShape = {
  filter: 'column' | 'row'
  colorMatrix: ColorMatrix
  legends: {
    label: Meta
    color: string
    shape: LegendShape
  }[]
}
