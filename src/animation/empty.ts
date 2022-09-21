import {AnimationBase} from './base'
import {AnimationEmptyOptions, AnimationProps} from '../types'

export class AnimationEmpty extends AnimationBase<AnimationEmptyOptions> {
  constructor(props: AnimationProps<AnimationEmptyOptions>) {
    super(props)
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
