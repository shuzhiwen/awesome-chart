import {DataShape, LayerOptions, LayerType, LayoutCreator, RandomOptions, ScaleNiceShape} from '.'
import {getEasyGradientCreator} from '../utils'
import {Chart} from '../chart'

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
  debounceRender: Chart['debounceRender']
  createGradient: ReturnType<typeof getEasyGradientCreator>
}

export type TooltipOptions = {
  container: HTMLElement | null
  mode?: 'single' | 'group'
  pointSize?: number
  titleSize?: number
  titleColor?: string
  labelSize?: number
  labelColor?: string
  valueSize?: number
  valueColor?: string
  backgroundColor?: string
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
    axis?: string
    mode?: string
    type?: string
  }
  scale?: {
    nice: ScaleNiceShape
  }
  data: any
  style?: LayerSchema['style']
  animation: LayerSchema['style']
  event: Record<string, Function>
}

export interface CreateChartSchema extends ChartProps {
  layers?: CreateLayerSchema[]
  afterCreate?: (chart: Chart) => void
}
