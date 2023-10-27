import {Graphics} from 'pixi.js'
import {AnimationDict} from '../animation'
import {ChartTheme} from './core'
import {D3Selection, DrawerTarget} from './draw'

type AnimationType = Keys<AnimationDict>

type LayerAnimation<T> = Computable<Partial<T>, ChartTheme>

type AnimationOptions<T extends AnimationType = AnimationType> =
  AnimationProps<T> & {type: T}

type AnimationProps<T extends AnimationType> = AnimationDict[T]['options']

type UpdateAnimationOptions = {
  easing: Easing
  duration: number
  delay: number
}

type BasicAnimationOptions = UpdateAnimationOptions & {
  id: string
  /**
   * Basic elements to be animated.
   * @internal
   */
  targets: Maybe<D3Selection | Graphics[]>
  /**
   * Animation element parent node.
   * @internal
   */
  context: DrawerTarget
  /**
   * Whether to loop the animation.
   */
  loop: boolean
}

type AnimationFadeOptions = {
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

type AnimationPathOptions = {
  path: string
}

type AnimationZoomOptions = {
  /**
   * If set true, subsequent element's animation are triggered with a delay.
   * This configuration will cause the delay from the options to fail.
   */
  stagger: number
  initialScale: number
  startScale: number
  endScale: number
}

type AnimationRotateOptions = {
  /**
   * If set true, subsequent element's animation are triggered with a delay.
   * This configuration will cause the delay from the options to fail.
   */
  stagger: number
  initialRotation: number
}

type AnimationMoveOptions = {
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

type AnimationEraseOptions = {
  /**
   * The direction in which the erase animation proceeds.
   */
  direction: Position4 | 'clockwise' | 'anticlockwise'
}

type AnimationScanOptions = {
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
