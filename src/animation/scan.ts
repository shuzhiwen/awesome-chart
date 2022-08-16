import {select} from 'd3'
import {AnimationBase} from './base'
import anime, {AnimeInstance, AnimeParams} from 'animejs'
import {isCanvasContainer, isSvgContainer, mergeAlpha} from '../utils'
import {
  AnimationScanOptions as Options,
  AnimationProps as Props,
  D3Selection,
  DrawerTarget,
} from '../types'

const getAttributes = (direction: Options['direction']) => {
  if (direction === 'left' || direction === 'right') {
    return ['x1', 'x2'] as const
  } else if (direction === 'top' || direction === 'bottom') {
    return ['y1', 'y2'] as const
  } else if (direction === 'outer' || direction === 'inner') {
    return ['r'] as const
  }
}

const insertOffsets = (props: {parentNode: D3Selection; color: string; opacity: number}) => {
  const {parentNode, color, opacity} = props
  const minColor = mergeAlpha(color, 0)
  const maxColor = mergeAlpha(color, opacity)

  parentNode.append('stop').attr('offset', '20%').style('stop-color', minColor)
  parentNode.append('stop').attr('offset', '45%').style('stop-color', maxColor)
  parentNode.append('stop').attr('offset', '55%').style('stop-color', maxColor)
  parentNode.append('stop').attr('offset', '80%').style('stop-color', minColor)

  return parentNode
}

const createGradient = (props: {
  id?: string
  parentNode: D3Selection
  direction: Options['direction']
  color: string
  opacity: number
}) => {
  let targets
  const {parentNode, id, direction, color, opacity} = props
  const attributes = getAttributes(direction)

  parentNode
    .append('filter')
    .attr('id', `scan-filter-${id}`)
    .append('feGaussianBlur')
    .attr('in', 'SourceGraphic')
    .attr('stdDeviation', 0)
  if (attributes?.[0] === 'r') {
    targets = parentNode
      .append('radialGradient')
      .attr('id', `scan-gradient-${id}`)
      .attr('r', direction === 'inner' ? '300%' : '0%')
  } else if (attributes?.length === 2) {
    targets = parentNode
      .append('linearGradient')
      .attr('id', `scan-gradient-${id}`)
      .attr('x1', '0%')
      .attr('x2', '0%')
      .attr('y1', '0%')
      .attr('y2', '0%')
      .attr(attributes[0], direction === 'left' || direction === 'top' ? '100%' : '-100%')
      .attr(attributes[1], direction === 'left' || direction === 'top' ? '200%' : '0%')
  }

  return insertOffsets({parentNode: targets as D3Selection, color, opacity})
}

export class AnimationScan extends AnimationBase<Options> {
  private defs: Maybe<D3Selection>

  private target: Maybe<DrawerTarget>

  private extraNode: Maybe<DrawerTarget>

  private instance: Maybe<AnimeInstance>

  constructor(props: Props<Options>) {
    super(props)
  }

  init() {
    const {targets, context, direction = 'top', color = 'white', opacity = 1} = this.options

    if (isSvgContainer(targets) && isSvgContainer(context)) {
      this.defs = context.append('defs')
      this.target = createGradient({
        id: this.id,
        parentNode: this.defs,
        direction,
        color,
        opacity,
      })
      this.extraNode = context.append('g').attr('id', `scan-target-${this.id}`)
      this.extraNode
        .append('rect')
        .attr('x', 0)
        .attr('y', 0)
        .attr('width', '100%')
        .attr('height', '100%')
        .attr('clip-path', `url(#scan-clip-path-${this.id})`)
        .attr('filter', `url(#scan-filter-${this.id})`)
        .attr('fill', `url(#scan-gradient-${this.id})`)

      const clipPath = this.defs.append('clipPath').attr('id', `scan-clip-path-${this.id}`).node()

      targets.nodes().forEach((item) => {
        clipPath?.appendChild(select(item).clone(false).node())
      })
    }

    if (!isSvgContainer(targets) && isCanvasContainer(context)) {
      this.log.warn('Animation not support for canvas mode.')
    }
  }

  play() {
    const {targets, context, delay, duration, easing, direction = 'top'} = this.options
    const attributes = getAttributes(direction)

    if (isSvgContainer(context) && isSvgContainer(this.target)) {
      const configs: AnimeParams = {
        targets: this.target.node(),
        duration,
        delay,
        update: this.process,
        loopBegin: this.start,
        loopComplete: this.end,
        easing,
      }

      if (attributes?.length === 2) {
        configs[attributes[0]] =
          direction === 'left' || direction === 'top' ? ['100%', '-100%'] : ['-100%', '100%']
        configs[attributes[1]] =
          direction === 'left' || direction === 'top' ? ['200%', '0%'] : ['0%', '200%']
      } else if (attributes?.[0] === 'r') {
        configs[attributes[0]] = direction === 'inner' ? ['300%', '0%'] : ['0%', '300%']
      }

      this.instance = anime(configs)
    }

    if (isCanvasContainer(context) && !isSvgContainer(targets) && targets) {
      this.log.warn('Animation not support for canvas mode.')
    }
  }

  destroy() {
    const {targets} = this.options

    if (isSvgContainer(targets)) {
      this.defs?.remove()
      this.target?.remove()
      this.extraNode?.remove()
      this.instance && anime.remove(this.instance)
    } else if (isCanvasContainer(targets)) {
      targets.forEach((target) => (target.clipPath = undefined))
    }
  }
}
