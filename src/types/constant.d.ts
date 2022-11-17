type Engine = 'svg' | 'canvas'

type Direction = 'horizontal' | 'vertical'

type Alignment = 'start' | 'middle' | 'end'

type Coordinate = 'geographic' | 'cartesian' | 'polar'

type Position2 = 'inner' | 'outer'

type Position4 = 'top' | 'right' | 'bottom' | 'left'

type Position5 = Position4 | 'center'

type Position9 = Position5 | 'leftTop' | 'leftBottom' | 'rightTop' | 'rightBottom'

type Priority = 'topHigh' | 'topLow' | 'bottomHigh' | 'bottomLow' | 'other'

type LegendShape = 'rect' | 'circle' | 'brokenLine' | 'dottedLine' | 'star'

/**
 * @see https://easings.net/
 */
type Easing =
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

type Curve =
  | 'curveLinear'
  | 'curveNatural'
  | 'curveBumpX'
  | 'curveBumpY'
  | 'curveMonotoneX'
  | 'curveMonotoneY'
  | 'curveStep'
  | 'curveStepAfter'
  | 'curveStepBefore'

type Tile =
  | 'treemapBinary'
  | 'treemapDice'
  | 'treemapSlice'
  | 'treemapSliceDice'
  | 'treemapSquarify'
