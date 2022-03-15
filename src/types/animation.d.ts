import {Object} from 'fabric/fabric-impl'
import {D3Selection, DrawerTarget} from '.'
import {animationMapping} from '../animation'

export type AnimationLifeCycle = 'init' | 'play' | 'start' | 'process' | 'end' | 'destroy'

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

export type AnimationType = keyof typeof animationMapping

export type BasicAnimationOptions = {
  id?: string
  type?: AnimationType
  targets?: D3Selection | Object[]
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

export type AnimationFadeOptions = BasicAnimationOptions & {
  initialOpacity?: number
  startOpacity?: number
  endOpacity?: number
}

export type AnimationZoomOptions = BasicAnimationOptions & {
  initialScale?: number
  startScale?: number
  endScale?: number
}

export type AnimationMoveOptions = BasicAnimationOptions & {
  initialOffset?: [number, number]
  startOffset?: [number, number]
  endOffset?: [number, number]
}

export type AnimationEraseOptions = BasicAnimationOptions & {
  direction?: Position4
}
