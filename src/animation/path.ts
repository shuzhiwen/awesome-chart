import {AnimationBase} from './base'
import {isCanvasContainer, isSvgContainer} from '../utils'
import {AnimationPathOptions as Options, AnimationProps as Props} from '../types'
import anime from 'animejs'

export class AnimationPath extends AnimationBase<Options> {
  instance: Maybe<anime.AnimeInstance> = null

  constructor(props: Props<Options>) {
    super(props)
    this.createTargets('path')
  }

  play() {
    const {targets, path, delay = 0, duration = 1000, easing = 'easeInOutSine'} = this.options

    if (isSvgContainer(targets) && isSvgContainer(path)) {
      const animePath = anime.path(path.node())
      this.instance = anime({
        targets: targets.nodes(),
        duration,
        delay,
        // translate must before at rotate
        translateX: animePath('x'),
        translateY: animePath('y'),
        rotate: animePath('angle'),
        update: this.process,
        loopBegin: this.start,
        loopComplete: this.end,
        easing,
      })
    } else if (isCanvasContainer(targets)) {
      this.log.warn('Animation not support for canvas mode.')
    }
  }

  destroy() {
    this.instance?.seek(0)
    if (this.options.targets) {
      anime.remove(this.options.targets)
    }
  }
}
