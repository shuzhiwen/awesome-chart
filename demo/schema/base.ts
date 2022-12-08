import {TooltipOptions} from '../../src/types'

export default (
  layers: any[],
  config?: Partial<{
    padding: Padding
    tooltipOptions: {
      render?: string
    } & Omit<TooltipOptions, 'container' | 'render'>
    hasBrush: boolean
  }>
) => ({
  adjust: true,
  engine: 'svg',
  padding: config?.padding || ([60, 60, 60, 60] as Padding),
  hasBrush: config?.hasBrush,
  tooltipOptions: {
    mode: 'single' as const,
    ...config?.tooltipOptions,
  },
  layers,
})
