import * as layer from '.'
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
  chord: layer.LayerText,
  flopper: layer.LayerFlopper,
  heatmap: layer.LayerHeatmap,
  indicator: layer.LayerText,
  interactive: layer.LayerInteractive,
  legend: layer.LayerLegend,
  line: layer.LayerLine,
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
