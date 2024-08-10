import {AnimationProps} from '../types'
import {AnimationBase} from './base'

export class AnimationEmpty extends AnimationBase {
  constructor(options: AnimationProps<'empty'>) {
    super({duration: 0, ...options})
  }

  play() {
    const {duration, delay} = this.options

    setTimeout(() => {
      setTimeout(this.end, duration)
      this.start()
      this.process()
    }, delay)
  }
}
