import {AnimationBase} from './base'
import {isCanvasCntr, isSvgCntr} from '../utils'
import {AnimationFadeOptions, AnimationProps} from '../types'
import anime from 'animejs'

export class AnimationFade extends AnimationBase<AnimationFadeOptions> {
  constructor(props: AnimationProps<AnimationFadeOptions>) {
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
    const {
      targets,
      delay,
      duration,
      easing,
      context,
      startOpacity = 0,
      endOpacity = 1,
    } = this.options

    anime({
      targets: isSvgCntr(targets) ? targets.nodes() : targets,
      easing,
      duration,
      delay,
      opacity: [startOpacity, endOpacity],
      loopBegin: this.start,
      loopComplete: this.end,
      update: (...args) => {
        this.process(...args)
        if (isCanvasCntr(context)) {
          this.renderCanvas()
        }
      },
    })
  }
}
