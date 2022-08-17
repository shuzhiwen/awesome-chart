import {AnimationBase} from './base'
import {isCanvasCntr, isSvgCntr} from '../utils'
import {AnimationEraseOptions as Options, AnimationProps as Props, D3Selection} from '../types'
import {canvasEasing, svgEasing} from './easing'
import {transition} from 'd3-transition'
import {fabric} from 'fabric'

export class AnimationErase extends AnimationBase<Options> {
  private defs: Maybe<D3Selection>

  private maskNode?: Maybe<fabric.Rect>

  constructor(props: Props<Options>) {
    super(props)
  }

  init() {
    const {targets, context, direction} = this.options

    if (isSvgCntr(targets) && isSvgCntr(context)) {
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
    }

    if (!isSvgCntr(targets) && isCanvasCntr(context)) {
      const {width = 0, height = 0} = context

      this.maskNode = new fabric.Rect({
        left: -width / 2 + (direction === 'left' ? width : 0),
        top: -height / 2 + (direction === 'top' ? height : 0),
        width: direction === 'left' || direction === 'right' ? 0 : width,
        height: direction === 'top' || direction === 'bottom' ? 0 : height,
      })

      targets?.forEach((target) => (target.clipPath = this.maskNode!))

      this.renderCanvas()
    }
  }

  play() {
    const {targets, context, delay, duration, easing, direction = 'right'} = this.options

    if (isSvgCntr(context)) {
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
    }

    if (isCanvasCntr(context) && !isSvgCntr(targets) && targets) {
      transition()
        .delay(delay)
        .duration(duration)
        .on('end', this.end)
        .on('start', () => {
          const {width = 0, height = 0} = context

          this.start()
          this.maskNode = Object.assign(this.maskNode!, {
            left: -width / 2 + (direction === 'left' ? width : 0),
            top: -height / 2 + (direction === 'top' ? height : 0),
            width: direction === 'left' || direction === 'right' ? 0 : width,
            height: direction === 'top' || direction === 'bottom' ? 0 : height,
          })
          this.maskNode.animate(
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
                targets.forEach((item) => {
                  item.clipPath && item.drawClipPathOnCache(this.getCanvasContext()!)
                })
                this.renderCanvas()
              },
            }
          )
        })
    }
  }

  destroy() {
    const {targets} = this.options

    if (isSvgCntr(targets)) {
      this.defs?.remove()
      targets.attr('clip-path', '')
    } else if (isCanvasCntr(targets)) {
      targets.forEach((target) => (target.clipPath = undefined))
    }

    this.defs = null
    this.maskNode = null
  }
}
