import {Graphics} from 'pixi.js'
import {AnimationDict} from '../anims'
import {ChartTheme} from './core'
import {D3Selection, DrawerTarget} from './draw'

export type AnimationType = Keys<AnimationDict>

export type LayerAnimation<T> = Computable<Partial<T>, ChartTheme>

export type AnimationOptions<T extends AnimationType = AnimationType> =
  AnimationProps<T> & {type: T}

export type AnimationProps<T extends AnimationType> = Partial<
  AnimationDict[T]['options']
>

export type UpdateAnimationOptions = {
  easing: Easing
  duration: number
  delay: number
}

export type BasicAnimationOptions = UpdateAnimationOptions & {
  id: string
  /**
   * Whether to loop the animation.
   */
  loop: boolean
  /**
   * Basic elements to be animated.
   */
  targets?: D3Selection | Graphics[]
  /**
   * Animation element parent node.
   */
  context?: DrawerTarget
}

export type AnimationFadeOptions = {
  /**
   * If set true, after the animation ends,
   * a corresponding recovery animation will be executed.
   */
  alternate: boolean
  /**
   * If set true, subsequent element's animation are triggered with a delay.
   * This configuration will cause the delay from the options to fail.
   */
  stagger: number
  initialOpacity: number
  startOpacity: number
  endOpacity: number
}

export type AnimationPathOptions = {
  path: string
}

export type AnimationZoomOptions = {
  /**
   * If set true, subsequent element's animation are triggered with a delay.
   * This configuration will cause the delay from the options to fail.
   */
  stagger: number
  initialScale: number
  startScale: number
  endScale: number
}

export type AnimationRotateOptions = {
  /**
   * If set true, subsequent element's animation are triggered with a delay.
   * This configuration will cause the delay from the options to fail.
   */
  stagger: number
  initialRotation: number
}

export type AnimationMoveOptions = {
  /**
   * If set true, after the animation ends,
   * a corresponding recovery animation will be executed.
   */
  alternate: boolean
  /**
   * If set true, subsequent element's animation are triggered with a delay.
   * This configuration will cause the delay from the options to fail.
   */
  stagger: number
  /**
   * If set true, subsequent element's animation are is different speed.
   * If value > 1, the subsequent elements will be faster and faster.
   * if value < 1, the subsequent elements will be slower and slower.
   */
  decayFactor: number
  initialOffset: Vec2
  startOffset: Vec2
  endOffset: Vec2
}

export type AnimationEraseOptions = {
  /**
   * The direction in which the erase animation proceeds.
   */
  direction: Position4 | 'clockwise' | 'anticlockwise'
}

export type AnimationScanOptions = {
  /**
   * Only for svg, the range in which the scan animation takes effect.
   */
  scope: 'all' | 'fill' | 'stroke'
  /**
   * The direction in which the scan animation proceeds.
   */
  direction: Position4
  color: string
  opacity: number
}
