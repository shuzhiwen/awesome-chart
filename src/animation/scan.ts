import anime, {AnimeParams} from 'animejs'
import {select} from 'd3'
import {Container, Graphics, Texture} from 'pixi.js'
import {AnimationProps, AnimationScanOptions, Box, D3Selection} from '../types'
import {createLinearGradients, isCC, isSC, uuid} from '../utils'
import {AnimationBase} from './base'

export class AnimationScan extends AnimationBase<AnimationScanOptions> {
  private key = uuid()

  private box: Maybe<Box>

  private defs: Maybe<D3Selection | Texture[]>

  private mask: Maybe<D3Selection | Graphics>

  private gradient: Maybe<D3Selection | Texture>

  constructor(options: AnimationProps<'scan'>) {
    super(options)
    if (isCC(this.options.context)) {
      this.box = this.canvasRoot.getBounds()
    }
  }

  private get isHorizontal() {
    return ['left', 'right'].includes(this.options.direction!)
  }

  private get isVertical() {
    return ['top', 'bottom'].includes(this.options.direction!)
  }

  private get stops() {
    const {color = 'white', opacity = 0} = this.options
    return [
      {offset: 0.2, color, opacity: 0},
      {offset: 0.45, color, opacity},
      {offset: 0.55, color, opacity},
      {offset: 0.8, color, opacity: 0},
    ]
  }

  private createGradient() {
    const {context} = this.options
    this.defs = isSC(context) ? context.append('defs') : []

    createLinearGradients({
      container: this.defs,
      schema: [
        {
          id: `scan-gradient-${this.key}`,
          stops: this.stops,
          ...(isSC(context) && {
            [this.isHorizontal ? 'x1' : 'y1']: '-100%',
            [this.isHorizontal ? 'x2' : 'y2']: '-200%',
          }),
          ...(isCC(context) &&
            (() => {
              const {x, y, width, height} = this.box!
              return this.isHorizontal
                ? {x1: x, x2: x + width, width: x + width, height: y + height}
                : {y1: y, y2: y + height, width: x + width, height: y + height}
            })()),
        },
      ],
    })

    this.gradient = isSC(this.defs)
      ? this.defs.select(`#scan-gradient-${this.key}`)
      : this.defs.find(
          (item) => item.gradientId === `scan-gradient-${this.key}`
        )
  }

  private cloneMaskNode(node: HTMLElement) {
    return select(node)
      .clone(false)
      .attr('fill', this.options.scope === 'stroke' ? 'black' : 'white')
      .attr('stroke', this.options.scope === 'fill' ? 'black' : 'white')
      .node()!
  }

  init() {
    const {targets, context} = this.options
    this.createGradient()

    if (isSC(targets) && isSC(context) && isSC(this.defs)) {
      this.mask = context
        .append('rect')
        .attr('x', 0)
        .attr('y', 0)
        .attr('width', '100%')
        .attr('height', '100%')
        .attr('mask', `url(#scan-mask-${this.key})`)
        .attr('fill', `url(#scan-gradient-${this.key})`)
        .style('pointer-events', 'none')
      this.defs
        .append('mask')
        .attr('id', `scan-mask-${this.key}`)
        .call((selector) => {
          targets.nodes().forEach((item) => {
            selector.node()?.appendChild(this.cloneMaskNode(item))
          })
        })
    }

    if (isCC(context) && !isSC(targets)) {
      const {x, y, width, height} = this.box!
      const container = new Container()

      this.mask = new Graphics()
        .beginTextureFill({texture: this.gradient as Texture})
        .drawRect(x, y, width, height)
        .endFill()

      container.addChild(...targets!.map((target) => target.clone()))

      this.mask.mask = container
      this.mask.position = {x, y}
      this.mask.interactive = false
      this.mask.x = this.isHorizontal ? -container.width : 0
      this.mask.y = this.isVertical ? -container.height : 0
      this.canvasRoot.addChild(this.mask)
    }
  }

  play() {
    const {context, direction, easing, duration, delay} = this.options
    const configs: AnimeParams = {
      update: this.process,
      loopBegin: this.start,
      loopComplete: this.end,
      duration,
      easing,
      delay,
    }

    if (isSC(context) && isSC(this.gradient)) {
      Object.assign(
        configs,
        {targets: this.gradient.node()},
        direction === 'right'
          ? {x1: ['-100%', '100%'], x2: [0, '200%']}
          : direction === 'left'
          ? {x1: ['100%', '-100%'], x2: ['200%', 0]}
          : direction === 'bottom'
          ? {y1: ['-100%', '100%'], y2: [0, '200%']}
          : direction === 'top'
          ? {y1: ['100%', '-100%'], y2: ['200%', 0]}
          : null
      )
    }

    if (isCC(context) && this.mask instanceof Graphics) {
      const {width, height} = this.mask.getBounds()
      Object.assign(
        configs,
        {targets: this.mask},
        this.isHorizontal
          ? {x: direction === 'right' ? [-width, width] : [width, -width]}
          : this.isVertical
          ? {y: direction === 'bottom' ? [-height, height] : [height, -height]}
          : null
      )
    }

    anime(configs)
  }

  destroy() {
    isSC(this.gradient) ? this.gradient.remove() : this.gradient?.destroy()
    isSC(this.defs) ? this.defs.remove() : this.defs?.length === 0
    isSC(this.mask) && this.mask.remove()

    this.gradient = null
    this.defs = null
    this.mask = null
  }
}
