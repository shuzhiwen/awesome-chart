import {AnimationBase} from '.'
import {createEvent, createLog} from '../utils'
import {AnimationEmptyOptions as Options, AnimationProps as Props} from '../types'

export class AnimationEmpty extends AnimationBase<Options> {
  readonly log = createLog(AnimationEmpty.name)

  readonly event = createEvent(AnimationEmpty.name)

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

  end() {
    this.options.loop && this.play()
  }
}
