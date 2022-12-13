import * as Layer from '.'
import {BasicLayerOptions, ChartContext} from '../types'
import {createClassRegister} from '../utils'

export default Layer
export * from './combine'
export * from './common'
export * from './base'
export * from './geography'
export * from './helpers'
export * from './display'
export * from './normal'
export * from './relation'

export const layerMapping = {
  arc: Layer.LayerArc,
  auxiliary: Layer.LayerAuxiliary,
  axis: Layer.LayerAxis,
  basemap: Layer.LayerBasemap,
  brush: Layer.LayerBrush,
  candle: Layer.LayerCandle,
  carousel: Layer.LayerCarousel,
  chord: Layer.LayerChord,
  dashboard: Layer.LayerDashboard,
  flopper: Layer.LayerFlopper,
  force: Layer.LayerForce,
  heatmap: Layer.LayerHeatmap,
  interactive: Layer.LayerInteractive,
  grid: Layer.LayerGrid,
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

export const registerCustomLayer = createClassRegister?.<
  string,
  Layer.LayerBase<BasicLayerOptions<any>>,
  [BasicLayerOptions<any>, ChartContext]
>(layerMapping)
