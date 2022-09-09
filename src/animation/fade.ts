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

  process(...args: any) {
    super.process(...args)
    const {context} = this.options

    if (isCanvasCntr(context)) {
      this.renderCanvas()
    }

    return args
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
    } = this.options

    anime({
      targets: isSvgCntr(targets) ? targets.nodes() : targets,
      easing,
      duration,
      update: this.process,
      loopBegin: this.start,
      loopComplete: this.end,
      keyframes: [
        {
          opacity: startOpacity,
          duration: 0,
          delay: 0,
        },
        {
          opacity: endOpacity,
          delay: stagger ? anime.stagger(stagger) : delay,
        },
        alternate
          ? {
              opacity: startOpacity,
              delay: 0,
            }
          : {
              duration: 0,
              delay: 0,
            },
      ],
    })
  }
}
