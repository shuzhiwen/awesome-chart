export const chartLifeCycles = new Set(['draw', 'destroy', 'rebuildScale'] as const)

export const tooltipEvents = new Set(['mouseover', 'mouseout', 'mousemove'] as const)

/**
 * Disabled event drawer means the drawer that has no interactive.
 */
export const disableEventDrawers = new Set(['text', 'line', 'area'])

/**
 * Dependant layer means the layer that create scale itself.
 */
export const dependantLayers = new Set([
  'axis',
  'heatmap',
  'odLine',
  'mark',
  'auxiliary',
  'legend',
  'brush',
  'interactive',
])

export const scaleTypes = new Set([
  'scaleX',
  'scaleY',
  'scaleYR',
  'scaleAngle',
  'scaleRadius',
  'scaleColor',
] as const)

export const animationLifeCycles = new Set([
  'init',
  'play',
  'start',
  'process',
  'end',
  'destroy',
] as const)

export const layerLifeCycles = new Set([
  'setData',
  'setScale',
  'setStyle',
  'update',
  'draw',
  'destroy',
  'drawBasic',
  'playAnimation',
] as const)

export const commonEvents = new Set([
  'click',
  'mouseover',
  'mouseout',
  'mousemove',
  'mouseup',
  'mousedown',
] as const)
