import {AnimationBase} from './base'
import {isCanvasCntr, isSvgCntr} from '../utils'
import {AnimationEraseOptions, AnimationProps, D3Selection} from '../types'
import anime, {AnimeParams} from 'animejs'
import {fabric} from 'fabric'

export class AnimationErase extends AnimationBase<AnimationEraseOptions> {
  private defs: Maybe<D3Selection>

  private maskNode: Maybe<fabric.Rect>

  constructor(props: AnimationProps<AnimationEraseOptions>) {
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
      const {width = 0, height = 0} = context.canvas!

      this.maskNode = new fabric.Rect({
        left: direction === 'left' ? width : 0,
        top: direction === 'top' ? height : 0,
        width: direction === 'left' || direction === 'right' ? 0 : width,
        height: direction === 'top' || direction === 'bottom' ? 0 : height,
        absolutePositioned: true,
      })

      targets?.forEach((target) => (target.clipPath = this.maskNode!))
      this.renderCanvas()
    }
  }

  process(...args: any) {
    super.process(...args)
    const {targets} = this.options

    if (!isSvgCntr(targets)) {
      targets?.forEach((item) => {
        item.clipPath && item.drawClipPathOnCache(this.getCanvasContext()!)
      })
      this.renderCanvas()
    }

    return args
  }

  play() {
    const {context, delay, duration, easing, direction = 'right'} = this.options
    const configs: AnimeParams = {
      duration,
      delay,
      easing,
      loopBegin: this.start,
      loopComplete: this.end,
      update: this.process,
    }

    if (isSvgCntr(context)) {
      Object.assign(configs, {
        targets: context.selectAll(`#erase-${this.id} rect`).nodes(),
        x: [direction === 'left' ? '100%' : '0%', '0%'],
        y: [direction === 'top' ? '100%' : '0%', '0%'],
        width: [direction === 'left' || direction === 'right' ? '0%' : '100%', '100%'],
        height: [direction === 'top' || direction === 'bottom' ? '0%' : '100%', '100%'],
      })
    }

    if (isCanvasCntr(context)) {
      const {width = 0, height = 0} = context.canvas!

      Object.assign(configs, {
        targets: this.maskNode,
        left: [direction === 'left' ? width : 0, 0],
        top: [direction === 'top' ? height : 0, 0],
        width: [direction === 'left' || direction === 'right' ? 0 : width, width],
        height: [direction === 'top' || direction === 'bottom' ? 0 : height, height],
      })
    }

    anime(configs)
  }

  destroy() {
    const {targets} = this.options

    if (isSvgCntr(targets)) {
      this.defs?.remove()
      targets.attr('clip-path', null)
    } else if (isCanvasCntr(targets)) {
      targets.forEach((target) => (target.clipPath = undefined))
    }

    this.defs = null
    this.maskNode = null
  }
}
