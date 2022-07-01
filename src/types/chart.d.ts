import {Chart} from '../core'
import {ElConfigShape} from './draw'
import {LayoutCreator} from './layout'
import {DataShape} from './data'
import {RandomOptions} from './utils'
import {ScaleNiceShape} from './scale'
import {getEasyGradientCreator} from '../utils'
import {BackupDataItemShape, LayerOptions, LayerScalesShape, LayerType} from './layer'

export type ChartState = 'initialize' | 'destroy' | 'ready' | 'warn'

export interface ChartContext {
  root: Chart['root']
  theme: Chart['theme']
  event: Chart['event']
  tooltip: Chart['tooltip']
  container: Chart['container']
  containerWidth: Chart['containerWidth']
  containerHeight: Chart['containerHeight']
  bindCoordinate: Chart['bindCoordinate']
  createSublayer: Chart['createLayer']
  createGradient: ReturnType<typeof getEasyGradientCreator>
}

export type TooltipDataShape = Maybe<{
  title: Meta
  list: Partial<{
    label?: Meta
    value?: Meta
    color?: string
  }>[]
}>

export interface TooltipOptions {
  container: HTMLElement | null
  mode?: 'single' | 'dimension' | 'category'
  pointSize?: number
  titleSize?: number
  labelSize?: number
  valueSize?: number
  textColor?: string
  backgroundColor?: string
  render?: (container: HTMLElement, data: Partial<ElConfigShape>) => void
  setTooltipData?: (data: TooltipDataShape, options: TooltipOptions) => TooltipDataShape
  getLayersBackupData?: () => BackupDataItemShape<unknown>
}

export interface ChartProps {
  container: HTMLElement
  width?: number
  height?: number
  adjust?: boolean
  engine?: Engine
  theme?: string[]
  padding?: Padding
  defineSchema?: AnyObject
  tooltipOptions?: TooltipOptions
  layoutCreator?: LayoutCreator
}

export interface LayerSchema {
  options?: LayerOptions
  data?: Maybe<DataShape>
  scale?: LayerScalesShape
  style?: AnyObject
  animation?: AnyObject
}

export interface RandomDataSchema extends RandomOptions {
  type: 'table' | 'tableList'
}

export interface CreateLayerSchema {
  type: LayerType
  options: {
    id: string
    layout: string
    coordinate?: Coordinate
    axis?: 'main' | 'minor'
    mode?: string
  }
  data: any
  scale?: ScaleNiceShape
  style?: LayerSchema['style']
  animation?: LayerSchema['animation']
  event?: AnyEventObject
}

export interface CreateChartSchema extends ChartProps {
  layers?: CreateLayerSchema[]
}
