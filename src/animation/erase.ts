import anime from 'animejs'
import {Graphics} from 'pixi.js'
import {AnimationEraseOptions, AnimationProps, Box, D3Selection} from '../types'
import {isSC, uuid} from '../utils'
import {AnimationBase} from './base'

export class AnimationErase extends AnimationBase<AnimationEraseOptions> {
  private key = uuid()

  private defs: Maybe<D3Selection>

  private mask: Maybe<Graphics>

  constructor(options: AnimationProps<'erase'>) {
    super(options)
  }

  get isXEnd() {
    return this.options.direction === 'left'
  }

  get isYEnd() {
    return this.options.direction === 'top'
  }

  get isHorizontal() {
    return (
      this.options.direction === 'left' || this.options.direction === 'right'
    )
  }

  updateClipPath(mask: Graphics, b: Box) {
    mask.clear()
    mask.beginFill(0xffffff).drawRect(b.x, b.y, b.width, b.height).endFill()
  }

  init() {
    const {targets, context} = this.options

    if (isSC(targets) && isSC(context)) {
      this.defs = context.append('defs')
      this.defs
        .append('clipPath')
        .attr('id', `erase-${this.key}`)
        .append('rect')
        .attr('x', this.isXEnd ? '100%' : '0%')
        .attr('y', this.isYEnd ? '100%' : '0%')
        .attr('width', this.isHorizontal ? '0%' : '100%')
        .attr('height', !this.isHorizontal ? '0%' : '100%')
      targets.attr('clip-path', `url(#erase-${this.key})`)
    } else {
      const {x, y, width, height} = this.canvasRoot.getBounds()
      this.canvasRoot.mask = this.mask = new Graphics()
      this.updateClipPath(this.mask, {
        x: this.isXEnd ? x + width : x,
        y: this.isYEnd ? y + height : y,
        width: this.isHorizontal ? 0 : width,
        height: !this.isHorizontal ? 0 : height,
      })
    }
  }

  play() {
    const {context} = this.options
    const rect = {x: 0, y: 0, width: 0, height: 0}

    if (isSC(context)) {
      anime({
        ...this.basicConfig,
        targets: context.selectAll(`#erase-${this.key} rect`).nodes(),
        x: [this.isXEnd ? '100%' : '0%', '0%'],
        y: [this.isYEnd ? '100%' : '0%', '0%'],
        width: [this.isHorizontal ? '0%' : '100%', '100%'],
        height: [!this.isHorizontal ? '0%' : '100%', '100%'],
      })
    } else {
      const {x, y, width, height} = this.canvasRoot.getBounds()

      anime({
        ...this.basicConfig,
        update: () => this.updateClipPath(this.mask!, rect),
        targets: rect,
        x: [this.isXEnd ? x + width : x, x],
        y: [this.isYEnd ? y + height : y, y],
        width: [this.isHorizontal ? 0 : width, width],
        height: [!this.isHorizontal ? 0 : height, height],
      })
    }
  }

  destroy() {
    if (this.defs && isSC(this.options.targets)) {
      this.options.targets.attr('clip-path', null)
      this.defs.remove()
      this.defs = null
    } else {
      this.mask = null
    }
  }
}
