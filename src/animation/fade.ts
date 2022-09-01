import {AnimationBase} from './base'
import {isSvgCntr} from '../utils'
import {AnimationFadeOptions as Options, AnimationProps as Props} from '../types'
import {canvasEasing} from './easing'
import anime from 'animejs'

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
      anime({
        targets: targets.nodes(),
        duration,
        delay,
        easing,
        loopBegin: this.start,
        loopComplete: this.end,
        opacity: [startOpacity, endOpacity],
      })
    }

    if (targets && !isSvgCntr(targets)) {
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
