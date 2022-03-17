import {DataShape, LayerOptions, LayerType, LayoutCreator, RandomOptions, ScaleNiceShape} from '.'
import {getEasyGradientCreator} from '../utils'
import {Chart} from '../chart'
import {ElConfigShape} from './draw'
import {BackupDataShape, LayerScalesShape} from './layer'

export type ChartState = 'initialize' | 'destroy' | 'ready' | 'warn'

export type ChartContext = {
  root: Chart['root']
  theme: Chart['theme']
  engine: Chart['engine']
  tooltip: Chart['tooltip']
  container: Chart['container']
  containerWidth: Chart['containerWidth']
  containerHeight: Chart['containerHeight']
  bindCoordinate: Chart['bindCoordinate']
  createGradient: ReturnType<typeof getEasyGradientCreator>
}

export type TooltipOptions = {
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

export type RandomDataSchema = RandomOptions & {
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
