import {AnimationBase} from './base'
import {isSvgCntr} from '../utils'
import {AnimationZoomOptions as Options, AnimationProps as Props} from '../types'
import {canvasEasing} from './easing'
import anime from 'animejs'

export class AnimationZoom extends AnimationBase<Options> {
  constructor(props: Props<Options>) {
    super(props)
  }

  init() {
    const {targets, initialScale = 0} = this.options

    if (isSvgCntr(targets)) {
      anime({
        targets,
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
    const {targets, delay, duration, easing, startScale = 0, endScale = 1} = this.options,
      start = Math.max(startScale, 5e-6),
      end = Math.max(endScale, 5e-6)

    if (isSvgCntr(targets)) {
      anime({
        targets: targets.nodes(),
        duration,
        delay,
        easing,
        loopBegin: this.start,
        loopComplete: this.end,
        scale: [start, end],
      })
    }

    if (targets && !isSvgCntr(targets)) {
      setTimeout(() => {
        setTimeout(this.end, duration)
        this.start()

        targets.forEach((target) => {
          target.scaleX = start
          target.scaleY = start
          target.animate(
            {
              scaleX: end,
              scaleY: end,
            },
            {
              duration,
              easing: canvasEasing.get(easing),
              onChange: this.renderCanvas,
            }
          )
        })
      }, delay)
    }
  }
}
