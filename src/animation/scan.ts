import {select} from 'd3'
import {fabric} from 'fabric'
import {AnimationBase} from './base'
import {cloneDeep, merge} from 'lodash'
import {Rect} from 'fabric/fabric-impl'
import anime, {AnimeInstance, AnimeParams} from 'animejs'
import {isCanvasCntr, isSvgCntr, mergeAlpha} from '../utils'
import {
  AnimationScanOptions as Options,
  AnimationProps as Props,
  D3Selection,
  GradientWithId,
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

const createSvgGradient = (props: {
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

const createCanvasGradient = (props: {
  direction: Options['direction']
  color: string
  opacity: number
}) => {
  const {direction, color, opacity} = props,
    attributes = getAttributes(direction),
    minColor = mergeAlpha(color, 0),
    maxColor = mergeAlpha(color, opacity),
    config = {type: '', coords: {x1: 0, x2: 0, y1: 0, y2: 0, r1: 0, r2: 0}}

  if (attributes?.[0] === 'r') {
    merge(config, {
      type: 'radial',
      coords: {r2: direction === 'inner' ? 3 : 0},
    })
  } else if (attributes?.length === 2) {
    merge(config, {
      type: 'linear',
      coords: {
        [attributes[0]]: direction === 'left' || direction === 'top' ? 1 : -1,
        [attributes[1]]: direction === 'left' || direction === 'top' ? 2 : 0,
      },
    })
  }

  return new fabric.Gradient({
    ...config,
    gradientUnits: 'percentage',
    colorStops: [
      {color: minColor, offset: 0.2},
      {color: maxColor, offset: 0.45},
      {color: maxColor, offset: 0.55},
      {color: minColor, offset: 0.8},
    ],
  })
}

export class AnimationScan extends AnimationBase<Options> {
  private defs: Maybe<D3Selection>

  private gradientNode: Maybe<D3Selection | GradientWithId>

  private maskNode: Maybe<D3Selection | Rect>

  private instance: Maybe<AnimeInstance>

  constructor(props: Props<Options>) {
    super(props)
  }

  init() {
    const {
      targets,
      context,
      scope = 'all',
      direction = 'top',
      color = 'white',
      opacity = 1,
    } = this.options

    if (isSvgCntr(targets) && isSvgCntr(context)) {
      this.defs = context.append('defs')
      this.gradientNode = createSvgGradient({
        id: this.id,
        parentNode: this.defs,
        direction,
        color,
        opacity,
      })
      this.maskNode = context
        .append('rect')
        .attr('x', 0)
        .attr('y', 0)
        .attr('width', '100%')
        .attr('height', '100%')
        .attr('mask', `url(#scan-mask-${this.id})`)
        .attr('filter', `url(#scan-filter-${this.id})`)
        .attr('fill', `url(#scan-gradient-${this.id})`)
        .style('pointer-events', 'none')

      const mask = this.defs.append('mask').attr('id', `scan-mask-${this.id}`).node()

      targets.nodes().forEach((item) => {
        mask?.appendChild(
          select(item)
            .clone(false)
            .attr('fill', scope === 'stroke' ? 'black' : 'white')
            .attr('stroke', scope === 'fill' ? 'black' : 'white')
            .node()
        )
      })
    }

    if (!isSvgCntr(targets) && isCanvasCntr(context)) {
      this.gradientNode = createCanvasGradient({direction, color, opacity})

      this.maskNode = new fabric.Rect({
        top: -(context.height ?? 0) / 2,
        left: -(context.width ?? 0) / 2,
        width: context.width,
        height: context.height,
        fill: this.gradientNode,
      })

      context.addWithUpdate(this.maskNode)
    }
  }

  play() {
    const {context, delay, duration, easing, direction = 'top'} = this.options
    const attributes = getAttributes(direction)

    if (isSvgCntr(context) && isSvgCntr(this.gradientNode)) {
      const configs: AnimeParams = {
        targets: this.gradientNode.node(),
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

    if (isCanvasCntr(context) && !isSvgCntr(this.gradientNode)) {
      const coords = cloneDeep(this.gradientNode?.coords ?? {})
      const configs: AnimeParams = {
        targets: coords,
        duration,
        delay,
        easing,
        loopBegin: this.start,
        loopComplete: this.end,
        update: (...args) => {
          this.process(...args)
          if (
            this.gradientNode &&
            !isSvgCntr(this.gradientNode) &&
            !isSvgCntr(this.maskNode) &&
            this.maskNode?.clipPath
          ) {
            this.gradientNode.coords = coords
            this.maskNode?.drawClipPathOnCache(this.getCanvasContext()!)
            this.renderCanvas()
          }
        },
      }

      if (attributes?.length === 2) {
        configs[attributes[0]] = direction === 'left' || direction === 'top' ? [1, -1] : [-1, 1]
        configs[attributes[1]] = direction === 'left' || direction === 'top' ? [2, 0] : [0, 2]
      } else if (attributes?.[0] === 'r') {
        configs[attributes[0]] = direction === 'inner' ? [3, 0] : [0, 3]
      }

      this.instance = anime(configs)
    }
  }

  destroy() {
    const {targets} = this.options

    if (isSvgCntr(targets)) {
      this.defs?.remove()
      isSvgCntr(this.maskNode) && this.maskNode.remove()
      this.instance && anime.remove(this.instance)
    } else if (isCanvasCntr(this.maskNode)) {
      this.maskNode.group?.remove(this.maskNode)
    }

    this.defs = null
    this.instance = null
    this.maskNode = null
    this.gradientNode = null
  }
}
