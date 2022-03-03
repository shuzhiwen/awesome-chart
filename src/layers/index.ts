import {TextLayer} from '.'

export * from './normal'
export * from './base'

export const layerMapping = {
  // base
  axis: TextLayer,
  legend: TextLayer,
  // normal
  text: TextLayer,
  matrix: TextLayer,
  indicator: TextLayer,
  // relation
  chord: TextLayer,
  // ui
  tabMenu: TextLayer,
}
