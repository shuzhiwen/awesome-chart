import {ChartTheme} from './core'
import {D3Selection, DrawerTarget} from './draw'
import {animationMapping} from '../animation'

export type AnimationType = keyof typeof animationMapping

export type LayerAnimation<T> = Computable<Partial<T>, ChartTheme>

export type AnimationOptions =
  | AnimationEmptyOptions
  | AnimationFadeOptions
  | AnimationPathOptions
  | AnimationZoomOptions
  | AnimationMoveOptions
  | AnimationEraseOptions
  | AnimationScanOptions

export type AnimationProps<Options extends AnimationOptions> = Partial<{
  context: Maybe<DrawerTarget>
  options: Options
}>

type BasicAnimationOptions<
  Type extends AnimationType = AnimationType,
  Options extends AnyObject = Record<never, never>
> = Partial<
  Options & {
    id: string
    type: Type
    targets: Maybe<D3Selection | fabric.Object[]>
    loop: boolean
    easing: Easing
    duration: number
    delay: number
  }
>

export type AnimationEmptyOptions = BasicAnimationOptions<'empty'>

export type AnimationFadeOptions = BasicAnimationOptions<
  'fade',
  {
    alternate: boolean
    stagger: number
    initialOpacity: number
    startOpacity: number
    endOpacity: number
  }
>

export type AnimationPathOptions = BasicAnimationOptions<
  'path',
  {
    path: string
  }
>

export type AnimationZoomOptions = BasicAnimationOptions<
  'zoom',
  {
    stagger: number
    initialScale: number
    startScale: number
    endScale: number
  }
>

export type AnimationMoveOptions = BasicAnimationOptions<
  'move',
  {
    alternate: boolean
    stagger: number
    decayFactor: number
    initialOffset: [number, number]
    startOffset: [number, number]
    endOffset: [number, number]
  }
>

export type AnimationEraseOptions = BasicAnimationOptions<
  'erase',
  {
    direction: Position4
  }
>

export type AnimationScanOptions = BasicAnimationOptions<
  'scan',
  {
    scope: 'all' | 'fill' | 'stroke'
    direction: Position4 | Position2
    color: string
    opacity: number
  }
>
