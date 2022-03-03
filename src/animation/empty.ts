import anime from 'animejs'
import {AnimationBase} from '.'
import {createEvent, createLog} from '../utils'
import {AnimationEmptyOptions as Options, AnimationProps as Props} from '../types'

const defaultOptions = {
  delay: 0,
  duration: 0,
  loop: false,
}

export class AnimationEmpty extends AnimationBase<Options> {
  readonly log = createLog('animation:empty')

  readonly event = createEvent('animation:empty')

  constructor({options, context}: Props<Options>) {
    super({defaultOptions, options, context})
  }

  play() {
    const {duration, loop, mode} = this.options

    if (mode === 'function') {
      this.start()
      this.process()
      this.end()
    } else if (mode === 'timer') {
      this.instance = anime({
        duration,
        loop,
        update: this.process,
        loopBegin: this.start,
        loopComplete: this.end,
      })
    }
  }

  destroy() {
    if (this.options.mode === 'timer') {
      anime.remove(this.instance)
    }
  }
}
