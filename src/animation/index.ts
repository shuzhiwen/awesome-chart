import * as Animation from '.'
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

export default Animation
export const animationMapping = {
  breathe: Animation.AnimationBreathe,
  erase: Animation.AnimationErase,
  empty: Animation.AnimationEmpty,
  fade: Animation.AnimationFade,
  move: Animation.AnimationMove,
  path: Animation.AnimationPath,
  scan: Animation.AnimationScan,
  zoom: Animation.AnimationZoom,
}
