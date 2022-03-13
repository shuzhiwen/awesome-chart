import {AnimationEmpty, AnimationFade, AnimationZoom} from '.'

export * from './base'
export * from './empty'
export * from './fade'
export * from './queue'
export * from './zoom'

export const animationMapping = {
  empty: AnimationEmpty,
  fade: AnimationFade,
  zoom: AnimationZoom,
}
