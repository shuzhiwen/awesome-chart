import anime from 'animejs'
import {AnimationProps, AnimationZoomOptions} from '../types'
import {isSC} from '../utils'
import {AnimationBase} from './base'

export class AnimationZoom extends AnimationBase<AnimationZoomOptions> {
  constructor(options: AnimationProps<'zoom'>) {
    super(options)
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
    const {targets, delay, stagger, startScale, endScale} = this.options,
      start = Math.max(startScale || 0, 5e-6),
      end = Math.max(endScale || 1, 5e-6)

    anime({
      ...this.basicConfig,
      targets: isSC(targets) ? targets.nodes() : targets?.map((g) => g.scale),
      delay: stagger ? anime.stagger(stagger) : delay,
      ...(isSC(targets)
        ? {scale: [start, end]}
        : {x: [start, end], y: [start, end]}),
    })
  }
}
