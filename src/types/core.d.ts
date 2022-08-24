import {Chart} from '../core'
import {ElConfigShape} from './draw'
import {LayoutCreator} from './layout'
import {DataShape} from './data'
import {RandomOptions} from './utils'
import {ScaleNiceShape} from './scale'
import {getEasyGradientCreator} from '../utils'
import {BackupDataItemShape, LayerOptions, LayerScalesShape, LayerType} from './layer'
import {AnimationEasing} from './animation'

export type ChartContext = Pick<
  Chart,
  | 'bindCoordinate'
  | 'container'
  | 'containerWidth'
  | 'containerHeight'
  | 'drawerScheduler'
  | 'event'
  | 'root'
  | 'theme'
  | 'tooltip'
> & {
  createGradient: ReturnType<typeof getEasyGradientCreator>
  createSublayer: Chart['createLayer']
}

export type ChartTheme = Readonly<
  Record<
    'graph' | 'text',
    {
      opacity: number
      fillOpacity: number
      strokeOpacity: number
      strokeWidth: number
      fill: string
      stroke: string
    }
  > & {
    palette: {
      main: string[]
    }
    text: {
      fontFamily: string
      fontSize: number
      fontWeight: number
      shadow: string
    }
    animation: Record<
      'enter' | 'loop' | 'update',
      {
        duration: number
        delay: number
        easing: AnimationEasing
      }
    >
  }
>

export type TooltipDataShape = Maybe<{
  title: Meta
  list: Partial<{
    label: Meta
    value: Meta
    color: string
  }>[]
}>

export type TooltipOptions = {
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

export type ChartProps = {
  container: HTMLElement
  width?: number
  height?: number
  adjust?: boolean
  engine?: Engine
  theme?: ChartTheme
  padding?: Padding
  defineSchema?: AnyObject
  tooltipOptions?: TooltipOptions
  layoutCreator?: LayoutCreator
}

export type LayerSchema = Partial<{
  options: LayerOptions
  data: Maybe<DataShape>
  scale: LayerScalesShape
  style: AnyObject
  animation: AnyObject
}>

export type RandomDataSchema = RandomOptions & {
  type: 'table' | 'tableList'
}

export type CreateChartSchema = ChartProps & {
  layers?: {
    type: LayerType
    data: any
    scale?: ScaleNiceShape
    style?: LayerSchema['style']
    animation?: LayerSchema['animation']
    event?: AnyEventObject
    options: {
      id: string
      layout: string
      coordinate?: Coordinate
      axis?: 'main' | 'minor'
      mode?: string
    }
  }[]
}
