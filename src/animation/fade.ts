import {AnimationBase} from '.'
import {createEvent, createLog, isSvgContainer} from '../utils'
import {AnimationFadeOptions as Options, AnimationProps as Props} from '../types'

export class AnimationFade extends AnimationBase<Options> {
  readonly log = createLog('animation:fade', AnimationFade.name)

  readonly event = createEvent('animation:fade')

  constructor(props: Props<Options>) {
    super(props)
  }

  play() {
    const {
      targets,
      debounceRender,
      delay = 0,
      duration = 1000,
      startOpacity = 0,
      endOpacity = 1,
    } = this.options

    if (isSvgContainer(targets)) {
      targets
        .attr('opacity', startOpacity)
        .transition()
        .delay(delay)
        .on('start', this.start)
        .duration(duration)
        .attr('opacity', endOpacity)
        .on('end', this.end)
    } else if (targets) {
      setTimeout(() => {
        this.start()
        targets.forEach((target) => {
          target.opacity = startOpacity
          target.animate('opacity', endOpacity, {duration, onChange: debounceRender})
        })
        setTimeout(this.end, duration)
      }, delay)
    }
  }

  end() {
    this.options.loop && this.play()
  }
}
