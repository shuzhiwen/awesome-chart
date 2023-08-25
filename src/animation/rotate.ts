import anime from 'animejs'
import {AnimationProps, AnimationRotateOptions} from '../types'
import {isSC} from '../utils'
import {AnimationBase} from './base'

export class AnimationRotate extends AnimationBase<AnimationRotateOptions> {
  constructor(options: AnimationProps<'rotate'>) {
    super(options)
  }

  init() {
    const {targets, initialRotation = 0} = this.options

    if (isSC(targets)) {
      anime({
        targets: targets.nodes(),
        rotate: initialRotation,
        duration: 0,
        delay: 0,
      })
    } else if (targets) {
      targets.forEach((target) => {
        target.rotation = initialRotation / Math.PI
      })
    }
  }

  play() {
    const {targets, delay, stagger} = this.options

    anime({
      ...this.basicConfig,
      targets: isSC(targets) ? targets.nodes() : targets,
      delay: stagger ? anime.stagger(stagger) : delay,
      rotation: `+=${Math.PI * 2}`,
      rotate: `+=360`,
    })
  }
}
