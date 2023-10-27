import anime from 'animejs'
import {arc} from 'd3'
import {Graphics} from 'pixi.js'
import {movePath} from '../draws'
import {AnimationEraseOptions, AnimationProps, Box, D3Selection} from '../types'
import {isSC, uuid} from '../utils'
import {AnimationBase} from './base'

export class AnimationErase extends AnimationBase<AnimationEraseOptions> {
  private key = uuid()

  private defs: Maybe<D3Selection>

  private mask: Maybe<Graphics>

  private box: Maybe<Box>

  constructor(options: AnimationProps<'erase'>) {
    super(options)
  }

  get isXEnd() {
    return this.options.direction === 'left'
  }

  get isYEnd() {
    return this.options.direction === 'top'
  }

  get isClockwise() {
    return this.options.direction === 'clockwise'
  }

  get isHorizontal() {
    return ['left', 'right'].includes(this.options.direction!)
  }

  get isPolar() {
    return ['clockwise', 'anticlockwise'].includes(this.options.direction!)
  }

  updateMask(data: Box | string) {
    if (!this.mask) {
      this.log.error('There is no mask available!')
      return
    }

    if (typeof data !== 'string') {
      this.mask.drawRect(data.x, data.y, data.width, data.height)
    } else if (this.box) {
      const {x, y, width, height} = this.box
      const [centerX, centerY] = [x + width / 2, y + height / 2]
      this.mask.drawPath(movePath({path: data, centerX, centerY}))
    }
  }

  init() {
    const {targets, context} = this.options

    if (isSC(targets) && isSC(context)) {
      this.defs = context.append('defs')
      const mask = this.defs.append('mask').attr('id', this.key)
      const {x, y, width, height} = (this.box = context.node().getBBox())

      targets.attr('mask', `url(#${this.key})`)

      if (this.isPolar) {
        mask
          .append('path')
          .attr('transform', `translate(${x + width / 2} ${y + height / 2})`)
          .attr('fill', 'white')
          .attr('d', '')
      } else {
        mask
          .append('rect')
          .attr('fill', 'white')
          .attr('x', this.isXEnd ? '100%' : '0%')
          .attr('y', this.isYEnd ? '100%' : '0%')
          .attr('width', this.isHorizontal ? '0%' : '100%')
          .attr('height', !this.isHorizontal ? '0%' : '100%')
      }
    } else {
      const {x, y, width, height} = (this.box = this.canvasRoot.getBounds())
      this.canvasRoot.mask = this.mask = new Graphics()

      if (this.isPolar) {
        this.updateMask('')
        this.mask.beginFill(0xffffff)
      } else {
        this.updateMask({
          x: this.isXEnd ? x + width : x,
          y: this.isYEnd ? y + height : y,
          width: this.isHorizontal ? 0 : width,
          height: !this.isHorizontal ? 0 : height,
        })
      }
    }
  }

  play() {
    const {context} = this.options
    const absArc = Math.PI * 2 - 1e-6
    const attrs = {x: 0, y: 0, width: 0, height: 0, endAngle: 0}
    const _arc = arc<any, any>().startAngle(0).innerRadius(0).outerRadius(1920)
    const getPath = () => _arc.endAngle(attrs.endAngle)(null)!

    if (isSC(context)) {
      if (this.isPolar) {
        anime({
          ...this.basicConfig,
          targets: attrs,
          endAngle: this.isClockwise ? absArc : -absArc,
          update: () => {
            context.selectAll(`#${this.key} path`).attr('d', getPath())
          },
        })
      } else {
        anime({
          ...this.basicConfig,
          targets: context.selectAll(`#${this.key} rect`).nodes(),
          x: [this.isXEnd ? '100%' : '0%', '0%'],
          y: [this.isYEnd ? '100%' : '0%', '0%'],
          width: [this.isHorizontal ? '0%' : '100%', '100%'],
          height: [!this.isHorizontal ? '0%' : '100%', '100%'],
        })
      }
    } else {
      const {x, y, width, height} = this.box!

      if (this.isPolar) {
        anime({
          ...this.basicConfig,
          targets: attrs,
          endAngle: this.isClockwise ? absArc : -absArc,
          update: () => this.updateMask(getPath()),
        })
      } else {
        anime({
          ...this.basicConfig,
          update: () => this.updateMask(attrs),
          targets: attrs,
          x: [this.isXEnd ? x + width : x, x],
          y: [this.isYEnd ? y + height : y, y],
          width: [this.isHorizontal ? 0 : width, width],
          height: [!this.isHorizontal ? 0 : height, height],
        })
      }
    }
  }

  destroy() {
    if (this.defs && isSC(this.options.targets)) {
      this.options.targets.attr('mask', null)
      this.defs.remove()
      this.defs = null
    } else {
      this.canvasRoot.mask = null
      this.mask = null
    }
  }
}
