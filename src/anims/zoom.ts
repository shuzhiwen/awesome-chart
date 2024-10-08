import anime from 'animejs'
import {AnimationProps, AnimationZoomOptions} from '../types'
import {isSC} from '../utils'
import {AnimationBase} from './base'

export class AnimationZoom extends AnimationBase<AnimationZoomOptions> {
  constructor(options: AnimationProps<'zoom'>) {
    super({
      stagger: 0,
      initialScale: 1e-6,
      startScale: 1e-6,
      endScale: 1,
      ...options,
    })
  }

  init() {
    const {targets, initialScale} = this.options

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
      start = Math.max(startScale, 1e-6),
      end = Math.max(endScale, 1e-6)

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
