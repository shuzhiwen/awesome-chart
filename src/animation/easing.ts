import * as d3 from 'd3-ease'

export const svgEasing = new Map<
  Easing | undefined,
  (normalizedTime: number) => number
>([
  [undefined, d3.easeSinInOut],
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
