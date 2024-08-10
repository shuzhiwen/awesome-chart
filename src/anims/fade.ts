import anime from 'animejs'
import {AnimationFadeOptions, AnimationProps} from '../types'
import {isSC} from '../utils'
import {AnimationBase} from './base'

export class AnimationFade extends AnimationBase<AnimationFadeOptions> {
  constructor(options: AnimationProps<'fade'>) {
    super({
      alternate: false,
      initialOpacity: 0,
      startOpacity: 0,
      endOpacity: 1,
      stagger: 0,
      ...options,
    })
  }

  init() {
    const {targets, initialOpacity} = this.options

    if (isSC(targets)) {
      targets.attr('opacity', initialOpacity)
    } else if (targets) {
      targets.forEach((target) => (target.alpha = initialOpacity))
    }
  }

  play() {
    const {targets, delay, alternate, stagger, startOpacity, endOpacity} =
        this.options,
      name = isSC(targets) ? 'opacity' : 'alpha',
      start = Math.max(startOpacity, 1e-6),
      end = Math.max(endOpacity, 1e-6)

    anime({
      ...this.basicConfig,
      targets: isSC(targets) ? targets.nodes() : targets,
      keyframes: [
        {[name]: start, duration: 0, delay: 0},
        {[name]: end, delay: stagger ? anime.stagger(stagger) : delay},
        alternate ? {[name]: start, delay: 0} : {duration: 0, delay: 0},
      ],
    })
  }
}
