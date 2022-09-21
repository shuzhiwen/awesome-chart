export const chartLifeCycles = new Set(['initialized', 'draw', 'destroy'] as const)

export const tooltipEvents = new Set(['mouseover', 'mouseout', 'mousemove'] as const)

export const disableEventDrawerType = new Set(['text', 'line', 'area'])

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

export const animationLifeCycles = new Set([
  'init',
  'play',
  'start',
  'process',
  'end',
  'destroy',
] as const)

export const scaleTypes = new Set([
  'scaleX',
  'scaleY',
  'scaleYR',
  'scaleAngle',
  'scaleRadius',
  'scaleColor',
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
