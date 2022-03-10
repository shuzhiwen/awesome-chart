import {AnimationEmpty, AnimationFade} from '.'

export * from './base'
export * from './empty'
export * from './fade'
export * from './queue'

export const animationMapping = {
  breathe: AnimationEmpty,
  empty: AnimationEmpty,
  erase: AnimationEmpty,
  fade: AnimationFade,
  move: AnimationEmpty,
  path: AnimationEmpty,
  scan: AnimationEmpty,
  scroll: AnimationEmpty,
  zoom: AnimationEmpty,
}
