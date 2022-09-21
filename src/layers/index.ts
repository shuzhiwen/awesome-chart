import * as Layer from '.'
import {BasicLayerOptions, ChartContext} from '../types'
import {LayerBase} from './base'

export * from './combine'
export * from './common'
export * from './base'
export * from './geography'
export * from './helpers'
export * from './display'
export * from './normal'
export * from './relation'

export default Layer
export const layerMapping = {
  arc: Layer.LayerArc,
  auxiliary: Layer.LayerAuxiliary,
  axis: Layer.LayerAxis,
  basemap: Layer.LayerBasemap,
  brush: Layer.LayerBrush,
  candle: Layer.LayerCandle,
  carousel: Layer.LayerCarousel,
  dashboard: Layer.LayerDashboard,
  flopper: Layer.LayerFlopper,
  force: Layer.LayerForce,
  heatmap: Layer.LayerHeatmap,
  interactive: Layer.LayerInteractive,
  legend: Layer.LayerLegend,
  line: Layer.LayerLine,
  mark: Layer.LayerMark,
  matrix: Layer.LayerMatrix,
  odLine: Layer.LayerODLine,
  pack: Layer.LayerPack,
  radar: Layer.LayerRadar,
  radial: Layer.LayerRadial,
  rect: Layer.LayerRect,
  sankey: Layer.LayerSankey,
  scatter: Layer.LayerScatter,
  text: Layer.LayerText,
  treemap: Layer.LayerTreemap,
  tree: Layer.LayerTree,
  wave: Layer.LayerWave,
}

export function registerCustomLayer<T extends LayerBase<BasicLayerOptions<any>>>(
  key: string,
  Klass: Newable<T, [BasicLayerOptions<any>, ChartContext]>
) {
  if (Object.keys(layerMapping).includes(key)) {
    console.error('Duplicate key for registerCustomLayer!')
    return
  }

  try {
    Object.assign(layerMapping, {[key]: Klass})
  } catch (e) {
    console.error('Invalid Class Constructor!\n', e)
  }
}
