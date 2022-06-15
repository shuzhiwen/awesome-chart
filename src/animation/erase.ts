import {AnimationBase} from './base'
import {isCanvasContainer, isSvgContainer} from '../utils'
import {AnimationEraseOptions as Options, AnimationProps as Props, D3Selection} from '../types'
import {canvasEasing, svgEasing} from './easing'
import {transition} from 'd3-transition'
import {fabric} from 'fabric'

export class AnimationErase extends AnimationBase<Options> {
  private defs: Maybe<D3Selection>

  constructor(props: Props<Options>) {
    super(props)
  }

  init() {
    const {targets, context, direction} = this.options

    if (isSvgContainer(targets) && isSvgContainer(context)) {
      this.defs = context.append('defs')
      this.defs
        .append('clipPath')
        .attr('id', `erase-${this.id}`)
        .append('rect')
        .attr('x', direction === 'left' ? '100%' : '0%')
        .attr('y', direction === 'top' ? '100%' : '0%')
        .attr('width', direction === 'left' || direction === 'right' ? '0%' : '100%')
        .attr('height', direction === 'top' || direction === 'bottom' ? '0%' : '100%')
      targets.attr('clip-path', `url(#erase-${this.id})`)
    } else if (!isSvgContainer(targets)) {
      targets?.forEach((target) => {
        const {width = 0, height = 0} = target

        target.clipPath = new fabric.Rect({
          left: -width / 2 + (direction === 'left' ? width : 0),
          top: -height / 2 + (direction === 'top' ? height : 0),
          width: direction === 'left' || direction === 'right' ? 0 : width,
          height: direction === 'top' || direction === 'bottom' ? 0 : height,
        })
      })
      this.renderCanvas()
    }
  }

  play() {
    const {
      targets,
      context,
      delay = 0,
      duration = 1000,
      easing = 'easeInOutSine',
      direction = 'right',
    } = this.options

    if (isSvgContainer(context)) {
      context
        .selectAll(`#erase-${this.id} rect`)
        .transition()
        .delay(delay)
        .attr('x', direction === 'left' ? '100%' : '0%')
        .attr('y', direction === 'top' ? '100%' : '0%')
        .attr('width', direction === 'left' || direction === 'right' ? '0%' : '100%')
        .attr('height', direction === 'top' || direction === 'bottom' ? '0%' : '100%')
        .transition()
        .duration(duration)
        .ease(svgEasing.get(easing)!)
        .on('start', this.start)
        .on('end', this.end)
        .attr('x', '0%')
        .attr('y', '0%')
        .attr('width', '100%')
        .attr('height', '100%')
    } else if (isCanvasContainer(context) && !isSvgContainer(targets) && targets) {
      transition()
        .delay(delay)
        .duration(duration)
        .on('end', this.end)
        .on('start', () => {
          this.start()
          targets.forEach((target) => {
            const {width = 0, height = 0} = target

            target.clipPath = Object.assign(target.clipPath!, {
              left: -width / 2 + (direction === 'left' ? width : 0),
              top: -height / 2 + (direction === 'top' ? height : 0),
              width: direction === 'left' || direction === 'right' ? 0 : width,
              height: direction === 'top' || direction === 'bottom' ? 0 : height,
            })
            target.clipPath?.animate(
              {
                left: -width / 2,
                top: -height / 2,
                width,
                height,
              },
              {
                duration,
                easing: canvasEasing.get(easing),
                onChange: () => {
                  target.drawClipPathOnCache(context.toCanvasElement().getContext('2d')!)
                  this.renderCanvas()
                },
              }
            )
          })
        })
    }
  }

  destroy() {
    const {targets} = this.options

    if (isSvgContainer(targets)) {
      targets.attr('clip-path', '')
      this.defs?.remove()
    } else if (isCanvasContainer(targets)) {
      targets.forEach((target) => (target.clipPath = undefined))
    }
  }
}
