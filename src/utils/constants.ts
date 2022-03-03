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

export const LIFE_CYCLE = [
  'setData',
  'setStyle',
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

export const TOOLTIP_EVENTS = ['mouseover', 'mouseout', 'mousemove'] as const
