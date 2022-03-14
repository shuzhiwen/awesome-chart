import {AnimationErase, AnimationEmpty, AnimationFade, AnimationMove, AnimationZoom} from '.'

export * from './base'
export * from './erase'
export * from './empty'
export * from './fade'
export * from './move'
export * from './queue'
export * from './zoom'

export const animationMapping = {
  erase: AnimationErase,
  empty: AnimationEmpty,
  fade: AnimationFade,
  move: AnimationMove,
  zoom: AnimationZoom,
}
