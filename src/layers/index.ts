import * as layer from '.'
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

export const layerMapping = {
  arc: layer.LayerArc,
  auxiliary: layer.LayerAuxiliary,
  axis: layer.LayerAxis,
  basemap: layer.LayerBasemap,
  brush: layer.LayerBrush,
  candle: layer.LayerCandle,
  carousel: layer.LayerCarousel,
  dashboard: layer.LayerDashboard,
  flopper: layer.LayerFlopper,
  force: layer.LayerForce,
  heatmap: layer.LayerHeatmap,
  interactive: layer.LayerInteractive,
  legend: layer.LayerLegend,
  line: layer.LayerLine,
  mark: layer.LayerMark,
  matrix: layer.LayerMatrix,
  odLine: layer.LayerODLine,
  pack: layer.LayerPack,
  radar: layer.LayerRadar,
  radial: layer.LayerRadial,
  rect: layer.LayerRect,
  sankey: layer.LayerSankey,
  scatter: layer.LayerScatter,
  text: layer.LayerText,
  treemap: layer.LayerTreemap,
  tree: layer.LayerTree,
}

export function registerCustomLayer<T extends LayerBase<BasicLayerOptions<any>>>(
  key: string,
  Klass: Newable<T, BasicLayerOptions<any>, ChartContext>
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
