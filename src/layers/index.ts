import * as layer from '.'
export * from './axis'
export * from './base'
export * from './helpers'
export * from './indicator'
export * from './legend'
export * from './normal'

export const layerMapping = {
  axis: layer.LayerAxis,
  baseMap: layer.LayerText,
  chord: layer.LayerText,
  flopper: layer.LayerFlopper,
  indicator: layer.LayerText,
  legend: layer.LayerLegend,
  line: layer.LayerLine,
  matrix: layer.LayerText,
  rect: layer.LayerRect,
  tabMenu: layer.LayerText,
  text: layer.LayerText,
}
