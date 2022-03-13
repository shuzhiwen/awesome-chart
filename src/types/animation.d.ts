import {Object} from 'fabric/fabric-impl'
import {D3Selection, DrawerTarget} from '.'
import {animationMapping} from '../animation'
import {Chart} from '../chart'

export type AnimationLifeCycle = 'init' | 'play' | 'start' | 'process' | 'end' | 'destroy'

export type AnimationType = keyof typeof animationMapping

export type BasicAnimationOptions = {
  id?: string
  type?: AnimationType
  targets?: D3Selection | Object[]
  duration?: number
  delay?: number
  loop?: boolean
  easing?: string
  // only for canvas
  debounceRender: Chart['debounceRender']
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
