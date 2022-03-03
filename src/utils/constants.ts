export const characters = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz0123456789'

// common set
export const SCALE_TYPE = [
  'scaleX',
  'scaleY',
  'scaleXT',
  'scaleYR',
  'scaleAngle',
  'scaleRadius',
] as const

export const LAYER_LIFE_CYCLES = [
  'setData',
  'setStyle',
  'draw',
  'destroy',
  'drawBasic',
  'playAnimation',
] as const

export const ANIMATION_LIFE_CYCLES = ['init', 'play', 'start', 'process', 'end', 'destroy'] as const

export const COMMON_EVENTS = [
  'click',
  'mouseover',
  'mouseout',
  'mousemove',
  'mouseup',
  'mousedown',
] as const

export const TOOLTIP_EVENTS = ['mouseover', 'mouseout', 'mousemove'] as const
