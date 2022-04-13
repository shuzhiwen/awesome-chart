import * as layer from '.'
export * from './common'
export * from './base'
export * from './helpers'
export * from './indicator'
export * from './normal'

export const layerMapping = {
  arc: layer.LayerArc,
  auxiliary: layer.LayerAuxiliary,
  axis: layer.LayerAxis,
  baseMap: layer.LayerText,
  chord: layer.LayerText,
  flopper: layer.LayerFlopper,
  indicator: layer.LayerText,
  interactive: layer.LayerInteractive,
  legend: layer.LayerLegend,
  line: layer.LayerLine,
  matrix: layer.LayerText,
  rect: layer.LayerRect,
  tabMenu: layer.LayerText,
  text: layer.LayerText,
}
