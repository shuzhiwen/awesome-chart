import {AnimationBase} from './base'
import {isSvgCntr} from '../utils'
import {AnimationFadeOptions as Options, AnimationProps as Props} from '../types'
import {canvasEasing, svgEasing} from './easing'

export class AnimationFade extends AnimationBase<Options> {
  constructor(props: Props<Options>) {
    super(props)
  }

  init() {
    const {targets, initialOpacity = 0} = this.options

    if (isSvgCntr(targets)) {
      targets.attr('opacity', initialOpacity)
    } else if (targets) {
      targets.forEach((target) => (target.opacity = initialOpacity))
      this.renderCanvas()
    }
  }

  play() {
    const {targets, delay, duration, easing, startOpacity = 0, endOpacity = 1} = this.options

    if (isSvgCntr(targets)) {
      targets
        .transition()
        .delay(delay)
        .duration(0)
        .attr('opacity', startOpacity)
        .transition()
        .duration(duration)
        .ease(svgEasing.get(easing)!)
        .on('start', this.start)
        .on('end', this.end)
        .attr('opacity', endOpacity)
    } else if (targets) {
      setTimeout(() => {
        setTimeout(this.end, duration)
        this.start()

        targets.forEach((target) => {
          target.opacity = startOpacity
          target.animate('opacity', endOpacity, {
            duration,
            easing: canvasEasing.get(easing),
            onChange: this.renderCanvas,
          })
        })
      }, delay)
    }
  }
}
