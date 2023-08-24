import anime from 'animejs'
import {AnimationPathOptions, AnimationProps} from '../types'
import {isCC, isSC} from '../utils'
import {AnimationBase} from './base'

export class AnimationPath extends AnimationBase<AnimationPathOptions> {
  private instances: anime.AnimeInstance[] = []

  constructor(options: AnimationProps<'path'>) {
    super(options)
    this.createTargets('path')
  }

  init() {
    if (isCC(this.options.context)) {
      this.log.warn('Animation not support for canvas mode.')
    }
  }

  play() {
    const {targets, path} = this.options

    if (isSC(targets) && isSC(path)) {
      const animePaths = path.nodes().map((node) => anime.path(node))
      const animationTargets = targets.nodes()

      animationTargets.forEach((target, i) => {
        this.instances.push(
          anime({
            ...this.basicConfig,
            targets: target,
            translateX: animePaths[i]?.('x'),
            translateY: animePaths[i]?.('y'),
            // translate must before at rotate
            rotate: animePaths[i]?.('angle'),
          })
        )
      })
    }
  }

  destroy() {
    if (isSC(this.options.targets)) {
      this.instances.forEach((item) => item.seek(0))
      anime.remove(this.options.targets.nodes())
    }
  }
}
