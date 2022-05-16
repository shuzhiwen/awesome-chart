import * as animation from '.'
export * from './base'
export * from './easing'
export * from './erase'
export * from './empty'
export * from './fade'
export * from './move'
export * from './path'
export * from './queue'
export * from './zoom'

export const animationMapping = {
  erase: animation.AnimationErase,
  empty: animation.AnimationEmpty,
  fade: animation.AnimationFade,
  move: animation.AnimationMove,
  path: animation.AnimationPath,
  zoom: animation.AnimationZoom,
}
