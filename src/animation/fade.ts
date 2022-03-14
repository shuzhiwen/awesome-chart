import {AnimationBase} from '.'
import {createEvent, createLog, isSvgContainer} from '../utils'
import {AnimationFadeOptions as Options, AnimationProps as Props} from '../types'

export class AnimationFade extends AnimationBase<Options> {
  readonly log = createLog('animation:fade', AnimationFade.name)

  readonly event = createEvent('animation:fade')

  constructor(props: Props<Options>) {
    super(props)
  }

  init() {
    const {targets, initialOpacity = 0} = this.options

    if (isSvgContainer(targets)) {
      targets.attr('opacity', initialOpacity)
    } else if (targets) {
      targets.forEach((target) => (target.opacity = initialOpacity))
      this.renderCanvas()
    }
  }

  play() {
    const {targets, delay = 0, duration = 1000, startOpacity = 0, endOpacity = 1} = this.options

    if (isSvgContainer(targets)) {
      targets
        .transition()
        .delay(delay)
        .duration(0)
        .attr('opacity', startOpacity)
        .transition()
        .duration(duration)
        .on('start', this.start)
        .on('end', this.end)
        .attr('opacity', endOpacity)
    } else if (targets) {
      setTimeout(() => {
        this.start()
        targets.forEach((target) => {
          target.opacity = startOpacity
          target.animate('opacity', endOpacity, {duration, onChange: this.renderCanvas})
        })
        setTimeout(this.end, duration)
      }, delay)
    }
  }

  end() {
    this.options.loop && this.play()
  }
}