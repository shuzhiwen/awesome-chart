import {animationMapping} from '../animation'
import {D3Selection, DrawerTarget, FabricObject} from './draw'

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

export type AnimationProps<T extends BasicAnimationOptions> = Partial<{
  context: Maybe<DrawerTarget>
  options: T
}>

export type BasicAnimationOptions<
  T extends AnimationType = AnimationType,
  P extends AnyObject = Record<never, never>
> = Partial<P> & {
  id?: string
  type?: T
  targets?: Maybe<D3Selection | FabricObject[]>
  loop?: boolean
  easing: AnimationEasing
  duration: number
  delay: number
}

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
