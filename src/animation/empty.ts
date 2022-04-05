import {AnimationBase} from './base'
import {AnimationEmptyOptions as Options, AnimationProps as Props} from '../types'

export class AnimationEmpty extends AnimationBase<Options> {
  constructor(props: Props<Options>) {
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
