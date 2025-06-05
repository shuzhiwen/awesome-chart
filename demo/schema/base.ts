import {
  CreateChartProps,
  GetFacetLayoutCreatorProps,
  TooltipOptions,
} from '../../src/types'

export type DemoLayersSchema = Maybe<
  CreateChartProps['layers'][number] | false
>[]

export default (
  layers: DemoLayersSchema,
  config?: Partial<{
    padding: Padding
    facet: GetFacetLayoutCreatorProps
    tooltipOptions: Omit<TooltipOptions, 'container'>
    hasBrush: boolean
  }>
) => ({
  adjust: true,
  engine: 'svg',
  padding: config?.padding || ([60, 60, 60, 60] as Padding),
  hasBrush: config?.hasBrush,
  facet: config?.facet,
  tooltipOptions: {
    mode: 'dimension',
    ...config?.tooltipOptions,
  },
  layers: layers.filter(Boolean),
})
