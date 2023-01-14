import {AnimationBase} from './base'
import {AnimationZoomOptions, AnimationProps} from '../types'
import {isSC} from '../utils'
import anime from 'animejs'

export class AnimationZoom extends AnimationBase<AnimationZoomOptions> {
  constructor(props: AnimationProps<AnimationZoomOptions>) {
    super(props)
  }

  init() {
    const {targets, initialScale = 5e-6} = this.options

    if (isSC(targets)) {
      anime({
        targets: targets.nodes(),
        scale: initialScale,
        duration: 0,
        delay: 0,
      })
    } else if (targets) {
      targets.forEach((target) => {
        target.scale = {x: initialScale, y: initialScale}
      })
    }
  }

  play() {
    const {
        targets,
        delay,
        duration,
        easing,
        stagger = null,
        startScale = 0,
        endScale = 1,
      } = this.options,
      start = Math.max(startScale, 5e-6),
      end = Math.max(endScale, 5e-6)

    anime({
      targets: isSC(targets) ? targets.nodes() : targets?.map((g) => g.scale),
      easing,
      duration,
      delay: stagger ? anime.stagger(stagger) : delay,
      ...(isSC(targets)
        ? {scale: [start, end]}
        : {
            x: [start, end],
            y: [start, end],
          }),
      update: this.process,
      loopBegin: this.start,
      loopComplete: this.end,
    })
  }
}
