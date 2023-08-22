import anime from 'animejs'
import {AnimationFadeOptions, AnimationProps} from '../types'
import {isSC} from '../utils'
import {AnimationBase} from './base'

export class AnimationFade extends AnimationBase<AnimationFadeOptions> {
  constructor(options: AnimationProps<'fade'>) {
    super(options)
  }

  init() {
    const {targets, initialOpacity = 0} = this.options

    if (isSC(targets)) {
      targets.attr('opacity', initialOpacity)
    } else if (targets) {
      targets.forEach((target) => (target.alpha = initialOpacity))
    }
  }

  play() {
    const {
        targets,
        delay,
        duration,
        easing,
        alternate,
        stagger = null,
        startOpacity = 0,
        endOpacity = 1,
      } = this.options,
      name = isSC(targets) ? 'opacity' : 'alpha',
      start = Math.max(startOpacity, 5e-6),
      end = Math.max(endOpacity, 5e-6)

    anime({
      targets: isSC(targets) ? targets.nodes() : targets,
      easing,
      duration,
      update: this.process,
      loopBegin: this.start,
      loopComplete: this.end,
      keyframes: [
        {[name]: start, duration: 0, delay: 0},
        {[name]: end, delay: stagger ? anime.stagger(stagger) : delay},
        alternate ? {[name]: start, delay: 0} : {duration: 0, delay: 0},
      ],
    })
  }
}
