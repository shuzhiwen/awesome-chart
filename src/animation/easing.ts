import {AnimationEasing} from '../types'
import {fabric} from 'fabric'
import * as d3 from 'd3-ease'

export const svgEasing = new Map<AnimationEasing, (normalizedTime: number) => number>([
  ['easeInBack', d3.easeBackIn],
  ['easeInBounce', d3.easeBounceIn],
  ['easeInCirc', d3.easeCircleIn],
  ['easeInCubic', d3.easeCubicIn],
  ['easeInElastic', d3.easeElasticIn],
  ['easeInExpo', d3.easeExpIn],
  ['easeInOutBack', d3.easeBackInOut],
  ['easeInOutBounce', d3.easeBounceInOut],
  ['easeInOutCirc', d3.easeCircleInOut],
  ['easeInOutCubic', d3.easeCubicInOut],
  ['easeInOutElastic', d3.easeElasticInOut],
  ['easeInOutExpo', d3.easeExpInOut],
  ['easeInOutQuad', d3.easeQuadInOut],
  ['easeInOutSine', d3.easeSinInOut],
  ['easeInQuad', d3.easeQuadIn],
  ['easeInSine', d3.easeSinIn],
  ['easeOutBack', d3.easeBackOut],
  ['easeOutBounce', d3.easeBounceOut],
  ['easeOutCirc', d3.easeCircleOut],
  ['easeOutCubic', d3.easeCubicOut],
  ['easeOutElastic', d3.easeElasticOut],
  ['easeOutExpo', d3.easeExpOut],
  ['easeOutQuad', d3.easeQuadOut],
  ['easeOutSine', d3.easeSinOut],
])

export const canvasEasing = new Map<
  AnimationEasing,
  (t: number, b: number, c: number, d: number) => number
>([
  ['easeInBack', fabric.util.ease.easeInBack],
  ['easeInBounce', fabric.util.ease.easeInBounce],
  ['easeInCirc', fabric.util.ease.easeInCirc],
  ['easeInCubic', fabric.util.ease.easeInCubic],
  ['easeInElastic', fabric.util.ease.easeInElastic],
  ['easeInExpo', fabric.util.ease.easeInExpo],
  ['easeInOutBack', fabric.util.ease.easeInOutBack],
  ['easeInOutBounce', fabric.util.ease.easeInOutBounce],
  ['easeInOutCirc', fabric.util.ease.easeInOutCirc],
  ['easeInOutCubic', fabric.util.ease.easeInOutCubic],
  ['easeInOutElastic', fabric.util.ease.easeInOutElastic],
  ['easeInOutExpo', fabric.util.ease.easeInOutExpo],
  ['easeInOutQuad', fabric.util.ease.easeInOutQuad],
  ['easeInOutSine', fabric.util.ease.easeInOutSine],
  ['easeInQuad', fabric.util.ease.easeInQuad],
  ['easeInSine', fabric.util.ease.easeInSine],
  ['easeOutBack', fabric.util.ease.easeOutBack],
  ['easeOutBounce', fabric.util.ease.easeOutBounce],
  ['easeOutCirc', fabric.util.ease.easeOutCirc],
  ['easeOutCubic', fabric.util.ease.easeOutCubic],
  ['easeOutElastic', fabric.util.ease.easeOutElastic],
  ['easeOutExpo', fabric.util.ease.easeOutExpo],
  ['easeOutQuad', fabric.util.ease.easeOutQuad],
  ['easeOutSine', fabric.util.ease.easeOutSine],
])
