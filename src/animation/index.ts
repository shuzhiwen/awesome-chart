import * as Animation from '.'
import {AnimationProps, AnimationType} from '../types'
import {createClassRegister} from '../utils'

export * from './base'
export * from './easing'
export * from './empty'
export * from './erase'
export * from './fade'
export * from './move'
export * from './path'
export * from './queue'
export * from './scan'
export * from './zoom'

export interface AnimationDict {
  erase: Animation.AnimationErase
  empty: Animation.AnimationEmpty
  fade: Animation.AnimationFade
  move: Animation.AnimationMove
  path: Animation.AnimationPath
  scan: Animation.AnimationScan
  zoom: Animation.AnimationZoom
}

export const AnimationDict = {
  erase: Animation.AnimationErase,
  empty: Animation.AnimationEmpty,
  fade: Animation.AnimationFade,
  move: Animation.AnimationMove,
  path: Animation.AnimationPath,
  scan: Animation.AnimationScan,
  zoom: Animation.AnimationZoom,
}

export const registerCustomAnimation = createClassRegister?.<
  string,
  Animation.AnimationBase<AnyObject>,
  AnimationProps<AnimationType>
>(AnimationDict)
