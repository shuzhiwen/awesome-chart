import {Chart} from '../chart'
import {ElConfigShape} from './draw'
import {BackupDataShape, LayerOptions, LayerScalesShape, LayerType} from './layer'
import {LayoutCreator} from './layout'
import {DataShape} from './data'
import {RandomOptions} from './utils'
import {ScaleNiceShape} from './scale'
import {getEasyGradientCreator} from '../utils'

export type ChartState = 'initialize' | 'destroy' | 'ready' | 'warn'

export interface ChartContext {
  root: Chart['root']
  theme: Chart['theme']
  engine: Chart['engine']
  tooltip: Chart['tooltip']
  container: Chart['container']
  containerWidth: Chart['containerWidth']
  containerHeight: Chart['containerHeight']
  bindCoordinate: Chart['bindCoordinate']
  createSublayer: Chart['createLayer']
  createGradient: ReturnType<typeof getEasyGradientCreator>
}

export interface TooltipOptions {
  container: HTMLElement | null
  mode?: 'single' | 'dimension' | 'category'
  pointSize?: number
  titleSize?: number
  titleColor?: string
  labelSize?: number
  labelColor?: string
  valueSize?: number
  valueColor?: string
  backgroundColor?: string
  render?: Maybe<
    (container: HTMLElement, data: ElConfigShape, backup: BackupDataShape<AnyObject>) => void
  >
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
  animation?: LayerSchema['style']
  event?: Record<string, Function>
}

export interface CreateChartSchema extends ChartProps {
  layers?: CreateLayerSchema[]
  afterCreate?: (chart: Chart) => void
}
