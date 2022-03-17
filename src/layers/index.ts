import * as layer from '.'
export * from './base'
export * from './helpers'
export * from './normal'

export const layerMapping = {
  axis: layer.LayerText,
  baseMap: layer.LayerText,
  chord: layer.LayerText,
  indicator: layer.LayerText,
  legend: layer.LayerText,
  line: layer.LayerLine,
  matrix: layer.LayerText,
  tabMenu: layer.LayerText,
  text: layer.LayerText,
}
