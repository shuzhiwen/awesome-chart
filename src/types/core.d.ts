import {Chart} from '../core'
import {ElConfig} from './draw'
import {LayoutCreator} from './layout'
import {RandomOptions} from './utils'
import {ScaleNice} from './scale'
import {getEasyGradientCreator} from '../utils'
import {CacheLayerData, LayerScale, LayerType} from './base'
import {AnimationOptions, LayerAnimation} from './animation'
import {LayerOptions} from './options'
import {LayerData, TooltipData} from './data'
import {LayerStyle} from './styles'

export type ChartContext = Pick<
  Chart,
  | 'bindCoordinate'
  | 'container'
  | 'containerWidth'
  | 'containerHeight'
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
      evented: boolean
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
    animation: Record<'presets', Record<string, AnimationOptions>> &
      Record<
        'enter' | 'loop' | 'update',
        {
          duration: number
          delay: number
          easing: Easing
        }
      >
  }
>

export type TooltipOptions = {
  container: HTMLElement | null
  mode?: 'single' | 'dimension' | 'category'
  pointSize?: number
  titleSize?: number
  labelSize?: number
  valueSize?: number
  textColor?: string
  backgroundColor?: string
  render?: (container: HTMLElement, data: Partial<ElConfig>) => void
  setTooltipData?: (data: TooltipData, options: TooltipOptions) => TooltipData
  getLayersBackupData?: () => CacheLayerData<unknown>['data']['data']
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
  tooltipOptions?: Partial<TooltipOptions>
  layoutCreator?: LayoutCreator
}

export type LayerSchema = Partial<{
  options: LayerOptions
  data: Maybe<LayerData>
  scale: LayerScale
  style: LayerStyle<AnyObject>
  animation: LayerAnimation<AnyObject>
}>

export type RandomDataProps = RandomOptions & {
  type: 'table' | 'tableList'
}

export type CreateChartProps = ChartProps & {
  layers?: {
    type: LayerType
    data: any
    scale?: ScaleNice
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
