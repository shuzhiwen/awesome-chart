import * as animation from '.'
export * from './base'
export * from './breathe'
export * from './easing'
export * from './erase'
export * from './empty'
export * from './fade'
export * from './move'
export * from './path'
export * from './scan'
export * from './queue'
export * from './zoom'

export const animationMapping = {
  breathe: animation.AnimationBreathe,
  erase: animation.AnimationErase,
  empty: animation.AnimationEmpty,
  fade: animation.AnimationFade,
  move: animation.AnimationMove,
  path: animation.AnimationPath,
  scan: animation.AnimationScan,
  zoom: animation.AnimationZoom,
}
