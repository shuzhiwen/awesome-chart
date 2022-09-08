import {AnimationBase} from './base'
import {isCanvasCntr, isSvgCntr} from '../utils'
import {AnimationZoomOptions, AnimationProps} from '../types'
import anime from 'animejs'

export class AnimationZoom extends AnimationBase<AnimationZoomOptions> {
  constructor(props: AnimationProps<AnimationZoomOptions>) {
    super(props)
  }

  init() {
    const {targets, initialScale = 5e-6} = this.options

    if (isSvgCntr(targets)) {
      anime({
        targets: targets.nodes(),
        scale: initialScale,
        duration: 0,
        delay: 0,
      })
    } else if (targets) {
      targets.forEach((target) => {
        target.scaleX = initialScale
        target.scaleY = initialScale
      })
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
        stagger = null,
        startScale = 0,
        endScale = 1,
      } = this.options,
      start = Math.max(startScale, 5e-6),
      end = Math.max(endScale, 5e-6)

    anime({
      targets: isSvgCntr(targets) ? targets.nodes() : targets,
      easing,
      duration,
      delay: stagger ? anime.stagger(stagger) : delay,
      scale: [start, end],
      scaleX: [start, end],
      scaleY: [start, end],
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
