import * as layer from '.'
export * from './common'
export * from './base'
export * from './geography'
export * from './helpers'
export * from './indicator'
export * from './normal'

export const layerMapping = {
  arc: layer.LayerArc,
  auxiliary: layer.LayerAuxiliary,
  axis: layer.LayerAxis,
  baseMap: layer.LayerBaseMap,
  chord: layer.LayerText,
  flopper: layer.LayerFlopper,
  heatmap: layer.LayerHeatmap,
  indicator: layer.LayerText,
  interactive: layer.LayerInteractive,
  legend: layer.LayerLegend,
  line: layer.LayerLine,
  matrix: layer.LayerText,
  rect: layer.LayerRect,
  scatter: layer.LayerScatter,
  text: layer.LayerText,
}
