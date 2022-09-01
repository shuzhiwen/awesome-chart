import {AnimationBase} from './base'
import {isCanvasCntr, isSvgCntr} from '../utils'
import {AnimationPathOptions as Options, AnimationProps as Props} from '../types'
import anime from 'animejs'

export class AnimationPath extends AnimationBase<Options> {
  private instances: anime.AnimeInstance[] = []

  constructor(props: Props<Options>) {
    super(props)
    this.createTargets('path')
  }

  init() {
    if (isCanvasCntr(this.options.context)) {
      this.log.warn('Animation not support for canvas mode.')
    }
  }

  play() {
    const {targets, path, delay, duration, easing} = this.options

    if (isSvgCntr(targets) && isSvgCntr(path)) {
      const animePaths = path.nodes().map((node) => anime.path(node)),
        animationTargets = targets.nodes()

      animationTargets.forEach((target, i) =>
        this.instances.push(
          anime({
            targets: target,
            duration,
            delay,
            // translate must before at rotate
            translateX: animePaths[i]?.('x'),
            translateY: animePaths[i]?.('y'),
            rotate: animePaths[i]?.('angle'),
            update: this.process,
            loopBegin: this.start,
            loopComplete: this.end,
            easing,
          })
        )
      )
    }
  }

  destroy() {
    if (isSvgCntr(this.options.targets)) {
      this.instances.forEach((item) => item.seek(0))
      anime.remove(this.options.targets.nodes())
    }
  }
}
