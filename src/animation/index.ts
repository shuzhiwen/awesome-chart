import * as animation from '.'
export * from './base'
export * from './erase'
export * from './empty'
export * from './fade'
export * from './move'
export * from './queue'
export * from './zoom'

export const animationMapping = {
  erase: animation.AnimationErase,
  empty: animation.AnimationEmpty,
  fade: animation.AnimationFade,
  move: animation.AnimationMove,
  zoom: animation.AnimationZoom,
}
