export const CHARACTERS = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz0123456789'

export const SCALE_TYPES = ['scaleX', 'scaleY', 'scaleAngle', 'scaleRadius'] as const

export const TOOLTIP_EVENTS = ['mouseover', 'mouseout', 'mousemove'] as const

export const ANIMATION_LIFE_CYCLES = ['init', 'play', 'start', 'process', 'end', 'destroy'] as const

export const LAYER_LIFE_CYCLES = [
  'setData',
  'setScale',
  'setStyle',
  'update',
  'draw',
  'destroy',
  'drawBasic',
  'playAnimation',
] as const

export const COMMON_EVENTS = [
  'click',
  'mouseover',
  'mouseout',
  'mousemove',
  'mouseup',
  'mousedown',
] as const
