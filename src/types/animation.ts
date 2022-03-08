import {D3Selection, DrawerTarget} from '.'
import {animationMapping} from '../animation'

export type AnimationLifeCycle = 'init' | 'play' | 'start' | 'process' | 'end' | 'destroy'

export type AnimationType = keyof typeof animationMapping | 'queue' | 'function'

export type BasicAnimationOptions = {
  id?: string
  engine?: Engine
  targets?: string | D3Selection
  duration?: number
  delay?: number
  loop?: boolean
}

export interface AnimationBaseProps<T extends BasicAnimationOptions> {
  context?: Maybe<DrawerTarget>
  options?: T
  defaultOptions: T
}

export interface AnimationProps<T extends BasicAnimationOptions> {
  context?: Maybe<DrawerTarget>
  options?: T
}

export type AnimationEmptyOptions = BasicAnimationOptions & {
  mode?: 'function' | 'timer'
}
