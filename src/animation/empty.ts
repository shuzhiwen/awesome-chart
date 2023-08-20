import {AnimationEmptyOptions} from '../types'
import {AnimationBase} from './base'

export class AnimationEmpty extends AnimationBase<AnimationEmptyOptions> {
  constructor(options: AnimationEmptyOptions) {
    super(options)
  }

  play() {
    const {duration = 0, delay = 0} = this.options

    setTimeout(() => {
      setTimeout(this.end, duration)
      this.start()
      this.process()
    }, delay)
  }
}
