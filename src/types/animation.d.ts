import {animationMapping} from '../animation'
import {D3Selection, DrawerTarget} from './draw'

export type AnimationType = keyof typeof animationMapping

export type AnimationProps<T extends AnimationOptions> = Partial<{
  context: Maybe<DrawerTarget>
  options: T
}>

export type AnimationOptions<
  T extends AnimationType = AnimationType,
  P extends AnyObject = Record<never, never>
> = Partial<P> & {
  id?: string
  type?: T
  targets?: Maybe<D3Selection | fabric.Object[]>
  loop?: boolean
  easing: Easing
  duration: number
  delay: number
}

export type AnimationEmptyOptions = AnimationOptions<'empty'>

export type AnimationFadeOptions = AnimationOptions<
  'fade',
  {
    alternate: boolean
    stagger: number
    initialOpacity: number
    startOpacity: number
    endOpacity: number
  }
>

export type AnimationPathOptions = AnimationOptions<
  'path',
  {
    path: string
  }
>

export type AnimationZoomOptions = AnimationOptions<
  'zoom',
  {
    stagger: number
    initialScale: number
    startScale: number
    endScale: number
  }
>

export type AnimationMoveOptions = AnimationOptions<
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

export type AnimationEraseOptions = AnimationOptions<
  'erase',
  {
    direction: Position4
  }
>

export type AnimationScanOptions = AnimationOptions<
  'scan',
  {
    scope: 'all' | 'fill' | 'stroke'
    direction: Position4 | Position2
    color: string
    opacity: number
  }
>
