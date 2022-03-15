import {AnimationBase} from '.'
import {isSvgContainer, safeTransform} from '../utils'
import {AnimationZoomOptions as Options, AnimationProps as Props} from '../types'
import {canvasEasing, svgEasing} from './easing'

export class AnimationZoom extends AnimationBase<Options> {
  constructor(props: Props<Options>) {
    super(props)
  }

  init() {
    const {targets, initialScale: initial = 0} = this.options

    if (isSvgContainer(targets)) {
      targets.attr('transform', safeTransform(targets.attr('transform'), 'scale', initial))
    } else if (targets) {
      targets.forEach((target) => {
        target.scaleX = initial
        target.scaleY = initial
      })
      this.renderCanvas()
    }
  }

  play() {
    const {
        targets,
        delay = 0,
        duration = 1000,
        easing = 'easeInOutSine',
        startScale = 0,
        endScale = 1,
      } = this.options,
      start = Math.max(startScale, Number.MIN_VALUE),
      end = Math.max(endScale, Number.MIN_VALUE)

    if (isSvgContainer(targets)) {
      targets
        .transition()
        .delay(delay)
        .duration(0)
        .attr('transform', safeTransform(targets.attr('transform'), 'scale', start))
        .transition()
        .duration(duration)
        .ease(svgEasing.get(easing)!)
        .on('start', this.start)
        .on('end', this.end)
        .attr('transform', safeTransform(targets.attr('transform'), 'scale', end))
    } else if (targets) {
      setTimeout(() => {
        setTimeout(this.end, duration)
        this.start()

        targets.forEach((target) => {
          target.scaleX = 0
          target.scaleY = 0
          target.animate(
            {
              scaleX: end,
              scaleY: end,
            },
            {
              duration,
              easing: canvasEasing.get(easing),
              onChange: this.renderCanvas,
            }
          )
        })
      }, delay)
    }
  }

  end() {
    this.options.loop && this.play()
  }
}
