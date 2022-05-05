import {Object as FabricObject} from 'fabric/fabric-impl'
import {animationMapping} from '../animation'
import {D3Selection, DrawerTarget} from './draw'

export type AnimationType = keyof typeof animationMapping

// see https://easings.net/
export type AnimationEasing =
  | 'easeInBack'
  | 'easeInBounce'
  | 'easeInCirc'
  | 'easeInCubic'
  | 'easeInElastic'
  | 'easeInExpo'
  | 'easeInOutBack'
  | 'easeInOutBounce'
  | 'easeInOutCirc'
  | 'easeInOutCubic'
  | 'easeInOutElastic'
  | 'easeInOutExpo'
  | 'easeInOutQuad'
  | 'easeInOutSine'
  | 'easeInQuad'
  | 'easeInSine'
  | 'easeOutBack'
  | 'easeOutBounce'
  | 'easeOutCirc'
  | 'easeOutCubic'
  | 'easeOutElastic'
  | 'easeOutExpo'
  | 'easeOutQuad'
  | 'easeOutSine'

export interface BasicAnimationOptions {
  id?: string
  type?: AnimationType
  targets?: D3Selection | FabricObject[]
  duration?: number
  delay?: number
  loop?: boolean
  easing?: AnimationEasing
}

export interface AnimationProps<T extends BasicAnimationOptions> {
  context?: Maybe<DrawerTarget>
  options?: T
}

export type AnimationEmptyOptions = BasicAnimationOptions

export interface AnimationFadeOptions extends BasicAnimationOptions {
  initialOpacity?: number
  startOpacity?: number
  endOpacity?: number
}

export interface AnimationZoomOptions extends BasicAnimationOptions {
  initialScale?: number
  startScale?: number
  endScale?: number
}

export interface AnimationMoveOptions extends BasicAnimationOptions {
  initialOffset?: [number, number]
  startOffset?: [number, number]
  endOffset?: [number, number]
}

export interface AnimationEraseOptions extends BasicAnimationOptions {
  direction?: Position4
}
