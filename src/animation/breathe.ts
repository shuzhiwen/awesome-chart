import {AnimationBase} from './base'
import {isSvgCntr} from '../utils'
import {AnimationBreatheOptions as Options, AnimationProps as Props, D3Selection} from '../types'
import anime from 'animejs'

const createSvgFilter = (props: {parentNode: D3Selection; id: string}) => {
  const {parentNode, id} = props
  const filter = parentNode
    .append('filter')
    .attr('id', `breathe-filter-${id}`)
    .attr('x', '-500%')
    .attr('y', '-500%')
    .attr('width', '1000%')
    .attr('height', '1000%')
  filter
    .append('feOffset')
    .attr('result', 'offOut')
    .attr('in', 'SourceGraphic')
    .attr('dx', 0)
    .attr('dy', 0)
  filter
    .append('feBlend')
    .attr('in', 'SourceGraphic')
    .attr('in2', 'blurOut')
    .attr('mode', 'lighten')
  const targets = filter
    .append('feGaussianBlur')
    .attr('result', 'blurOut')
    .attr('in', 'offOut')
    .attr('stdDeviation', 0)

  return targets
}

export class AnimationBreathe extends AnimationBase<Options> {
  private defs: Maybe<D3Selection>

  private filterNode: Maybe<D3Selection>

  constructor(props: Props<Options>) {
    super(props)
  }

  init() {
    const {targets, context} = this.options

    if (isSvgCntr(targets) && isSvgCntr(context)) {
      this.defs = context.append('defs')
      this.filterNode = createSvgFilter({parentNode: this.defs, id: this.id})
      targets.attr('filter', `url(#breathe-filter-${this.id})`)
    }

    if (!isSvgCntr(targets)) {
      this.log.warn('Animation not support for canvas mode.')
    }
  }

  play() {
    const {targets, delay, duration, easing, minOpacity = 0.3, stdDeviation = 10} = this.options

    if (isSvgCntr(targets)) {
      anime({
        targets: this.filterNode?.node(),
        duration,
        delay,
        opacity: [1, minOpacity, 1],
        stdDeviation: [0, stdDeviation, 0],
        update: this.process,
        loopBegin: this.start,
        loopComplete: this.end,
        easing,
      })
    }
  }

  destroy() {
    const {targets} = this.options

    if (isSvgCntr(targets)) {
      this.defs?.remove()
      targets.attr('filter', null)
    }

    this.defs = null
    this.filterNode = null
  }
}
