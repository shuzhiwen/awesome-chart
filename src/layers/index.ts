import * as layer from '.'
export * from './axis'
export * from './base'
export * from './helpers'
export * from './normal'

export const layerMapping = {
  axis: layer.LayerAxis,
  baseMap: layer.LayerText,
  chord: layer.LayerText,
  indicator: layer.LayerText,
  legend: layer.LayerText,
  line: layer.LayerLine,
  matrix: layer.LayerText,
  rect: layer.LayerRect,
  tabMenu: layer.LayerText,
  text: layer.LayerText,
}
