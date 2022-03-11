import {AnimationBase} from '.'
import {createEvent, createLog} from '../utils'
import {AnimationEmptyOptions as Options, AnimationProps as Props} from '../types'

export class AnimationEmpty extends AnimationBase<Options> {
  readonly log = createLog('animation:empty')

  readonly event = createEvent('animation:empty')

  constructor(props: Props<Options>) {
    super(props)
  }

  play() {
    const {duration = 0, delay = 0} = this.options

    setTimeout(() => {
      this.start()
      this.process()
      setTimeout(this.end, duration)
    }, delay)
  }

  end() {
    this.options.loop && this.play()
  }
}
