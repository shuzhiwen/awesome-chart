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

export interface BasicAnimationOptions<T extends AnimationType = AnimationType> {
  id?: string
  type?: T
  targets?: Maybe<D3Selection | FabricObject[]>
  loop?: boolean
  easing: AnimationEasing
  duration: number
  delay: number
}

export interface AnimationProps<T extends BasicAnimationOptions> {
  context?: Maybe<DrawerTarget>
  options?: T
}

export type AnimationEmptyOptions = BasicAnimationOptions<'empty'>

export type AnimationFadeOptions = BasicAnimationOptions<'fade'> &
  Partial<{
    initialOpacity: number
    startOpacity: number
    endOpacity: number
  }>

export type AnimationPathOptions = BasicAnimationOptions<'path'> &
  Partial<{
    path: string
  }>

export type AnimationZoomOptions = BasicAnimationOptions<'zoom'> &
  Partial<{
    initialScale: number
    startScale: number
    endScale: number
  }>

export type AnimationMoveOptions = BasicAnimationOptions<'move'> &
  Partial<{
    initialOffset: [number, number]
    startOffset: [number, number]
    endOffset: [number, number]
  }>

export type AnimationEraseOptions = BasicAnimationOptions<'erase'> &
  Partial<{
    direction: Position4
  }>

export type AnimationScanOptions = BasicAnimationOptions<'scan'> &
  Partial<{
    direction: Position4 | Position2
    color: string
    opacity: number
  }>
