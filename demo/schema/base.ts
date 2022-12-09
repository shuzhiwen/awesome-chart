import {GetFacetLayoutCreatorProps, TooltipOptions} from '../../src/types'

export default (
  layers: any[],
  config?: Partial<{
    padding: Padding
    facet: GetFacetLayoutCreatorProps
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
  facet: config?.facet,
  tooltipOptions: {
    mode: 'single' as const,
    ...config?.tooltipOptions,
  },
  layers,
})
