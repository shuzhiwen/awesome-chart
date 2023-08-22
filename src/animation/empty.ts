import {AnimationProps} from '../types'
import {AnimationBase} from './base'

export class AnimationEmpty extends AnimationBase {
  constructor(options: AnimationProps<'empty'>) {
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
