import {AnimationEmpty, AnimationFade} from '.'

export * from './base'
export * from './empty'
export * from './fade'
export * from './queue'

export const animationMapping = {
  empty: AnimationEmpty,
  fade: AnimationFade,
}
