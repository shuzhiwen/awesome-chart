import {Object} from 'fabric/fabric-impl'
import {D3Selection, DrawerTarget} from '.'
import {animationMapping} from '../animation'

export type AnimationLifeCycle = 'init' | 'play' | 'start' | 'process' | 'end' | 'destroy'

export type AnimationType = keyof typeof animationMapping | 'queue'

export type BasicAnimationOptions = {
  id?: string
  type?: AnimationType
  engine?: Engine
  targets?: D3Selection | Object[]
  duration?: number
  delay?: number
  loop?: boolean
}

export interface AnimationProps<T extends BasicAnimationOptions> {
  context?: Maybe<DrawerTarget>
  options?: T
}

export type AnimationFadeOptions = BasicAnimationOptions & {
  type: 'fade'
  initialOpacity?: number
  startOpacity?: number
  endOpacity?: number
}
