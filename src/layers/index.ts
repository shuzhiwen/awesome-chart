import * as layer from '.'
export * from './combine'
export * from './common'
export * from './base'
export * from './geography'
export * from './helpers'
export * from './indicator'
export * from './normal'
export * from './relation'

export const layerMapping = {
  arc: layer.LayerArc,
  auxiliary: layer.LayerAuxiliary,
  axis: layer.LayerAxis,
  basemap: layer.LayerBasemap,
  brush: layer.LayerBrush,
  candle: layer.LayerCandle,
  dashboard: layer.LayerDashboard,
  flopper: layer.LayerFlopper,
  heatmap: layer.LayerHeatmap,
  interactive: layer.LayerInteractive,
  legend: layer.LayerLegend,
  line: layer.LayerLine,
  mark: layer.LayerMark,
  matrix: layer.LayerMatrix,
  odLine: layer.LayerODLine,
  pack: layer.LayerPack,
  radar: layer.LayerRadar,
  rect: layer.LayerRect,
  sankey: layer.LayerSankey,
  scatter: layer.LayerScatter,
  text: layer.LayerText,
  treemap: layer.LayerTreemap,
  tree: layer.LayerTree,
}
