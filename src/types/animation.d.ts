import {Graphics} from 'pixi.js'
import {AnimationDict} from '../animation'
import {ChartTheme} from './core'
import {D3Selection, DrawerTarget} from './draw'

type AnimationType = Keys<AnimationDict>

type LayerAnimation<T> = Computable<Partial<T>, ChartTheme>

type AnimationOptions =
  | BasicAnimationOptions
  | AnimationEmptyOptions
  | AnimationFadeOptions
  | AnimationPathOptions
  | AnimationZoomOptions
  | AnimationMoveOptions
  | AnimationEraseOptions
  | AnimationScanOptions

type BasicAnimationOptions<
  Type extends AnimationType = AnimationType,
  Options extends AnyObject = Record<never, never>
> = Partial<
  Options & {
    id: string
    type: Type
    easing: Easing
    duration: number
    delay: number
    /**
     * If set true, the animation will loop infinitely.
     */
    loop: boolean
    /**
     * Basic elements to be animated.
     * @internal
     */
    targets: Maybe<D3Selection | Graphics[]>
    context: Maybe<DrawerTarget>
  }
>

type AnimationEmptyOptions = BasicAnimationOptions<'empty'>

type AnimationFadeOptions = BasicAnimationOptions<
  'fade',
  {
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
>

type AnimationPathOptions = BasicAnimationOptions<
  'path',
  {
    path: string
  }
>

type AnimationZoomOptions = BasicAnimationOptions<
  'zoom',
  {
    /**
     * If set true, subsequent element's animation are triggered with a delay.
     * This configuration will cause the delay from the options to fail.
     */
    stagger: number
    initialScale: number
    startScale: number
    endScale: number
  }
>

type AnimationMoveOptions = BasicAnimationOptions<
  'move',
  {
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
>

type AnimationEraseOptions = BasicAnimationOptions<
  'erase',
  {
    /**
     * The direction in which the erase animation proceeds.
     */
    direction: Position4
  }
>

type AnimationScanOptions = BasicAnimationOptions<
  'scan',
  {
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
>
