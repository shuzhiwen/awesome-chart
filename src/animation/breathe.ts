import anime from 'animejs'
import {isSvgCntr} from '../utils'
import {AnimationBase} from './base'
import {AnimationBreatheOptions, AnimationProps, D3Selection} from '../types'

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

export class AnimationBreathe extends AnimationBase<AnimationBreatheOptions> {
  private defs: Maybe<D3Selection>

  private filterNode: Maybe<D3Selection>

  constructor(props: AnimationProps<AnimationBreatheOptions>) {
    super(props)
  }

  init() {
    const {targets, context} = this.options

    if (isSvgCntr(targets) && isSvgCntr(context)) {
      this.defs = context.append('defs')
      this.filterNode = createSvgFilter({parentNode: this.defs, id: this.id})
      targets.attr('filter', `url(#breathe-filter-${this.id})`)
    }
  }

  play() {
    const {targets, delay, duration, easing, minOpacity = 0, blur = 2} = this.options

    if (isSvgCntr(targets)) {
      anime({
        targets: targets.nodes(),
        duration,
        delay,
        opacity: [1, minOpacity, 1],
        update: this.process,
        loopBegin: this.start,
        loopComplete: this.end,
        easing,
      })
      anime({
        targets: this.filterNode?.node(),
        duration,
        delay,
        stdDeviation: [0, blur, 0],
        easing,
      })
    }

    if (!isSvgCntr(targets)) {
      anime({
        targets,
        duration,
        delay,
        opacity: [1, minOpacity, 1],
        update: (...args) => (this.process(...args), this.renderCanvas()),
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
