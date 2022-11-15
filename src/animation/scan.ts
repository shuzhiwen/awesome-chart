import {select} from 'd3'
import {fabric} from 'fabric'
import {AnimationBase} from './base'
import {cloneDeep, merge} from 'lodash'
import {Gradient, Rect} from 'fabric/fabric-impl'
import anime, {AnimeParams} from 'animejs'
import {isCC, isSC, mergeAlpha} from '../utils'
import {AnimationScanOptions, AnimationProps, D3Selection} from '../types'

const getAttributes = (direction: AnimationScanOptions['direction']) => {
  if (direction === 'left' || direction === 'right') {
    return ['x1', 'x2'] as const
  } else if (direction === 'top' || direction === 'bottom') {
    return ['y1', 'y2'] as const
  } else if (direction === 'outer' || direction === 'inner') {
    return ['r'] as const
  }
  return []
}

const insertOffsets = (parentNode: D3Selection, color: string, opacity: number) => {
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
  direction: AnimationScanOptions['direction']
  color: string
  opacity: number
}) => {
  const {parentNode, id, direction, color, opacity} = props,
    isLeftOrTop = direction === 'left' || direction === 'top',
    attributes = getAttributes(direction)
  let targets

  if (attributes[0] === 'r') {
    targets = parentNode
      .append('radialGradient')
      .attr('id', `scan-gradient-${id}`)
      .attr('r', direction === 'inner' ? '300%' : '0%')
  } else if (attributes.length === 2) {
    targets = parentNode
      .append('linearGradient')
      .attr('id', `scan-gradient-${id}`)
      .attr('x1', '0%')
      .attr('x2', '0%')
      .attr('y1', '0%')
      .attr('y2', '0%')
      .attr(attributes[0], isLeftOrTop ? '100%' : '-100%')
      .attr(attributes[1], isLeftOrTop ? '200%' : '0%')
  }

  return insertOffsets(targets as D3Selection, color, opacity)
}

const createCanvasGradient = (props: {
  direction: AnimationScanOptions['direction']
  color: string
  opacity: number
}) => {
  const {direction, color, opacity} = props,
    config = {type: '', coords: {x1: 0, x2: 0, y1: 0, y2: 0, r1: 0, r2: 0}},
    isLeftOrTop = direction === 'left' || direction === 'top',
    attributes = getAttributes(direction),
    maxColor = mergeAlpha(color, opacity),
    minColor = mergeAlpha(color, 0)

  if (attributes.length === 1) {
    merge(config, {
      type: 'radial',
      coords: {r1: 0, r2: direction === 'inner' ? 3 : 0},
    })
  } else if (attributes.length === 2) {
    merge(config, {
      type: 'linear',
      coords: {
        [attributes[0]]: isLeftOrTop ? 1 : -1,
        [attributes[1]]: isLeftOrTop ? 2 : 0,
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

export class AnimationScan extends AnimationBase<AnimationScanOptions> {
  private defs: Maybe<D3Selection>

  private maskNode: Maybe<D3Selection | Rect>

  private gradientNode: Maybe<D3Selection | Gradient>

  constructor(props: AnimationProps<AnimationScanOptions>) {
    super(props)
  }

  init() {
    const {
      targets,
      context,
      scope = 'all',
      direction = 'right',
      color = 'white',
      opacity = 1,
    } = this.options

    if (isSC(targets) && isSC(context)) {
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
        .attr('fill', `url(#scan-gradient-${this.id})`)
        .style('pointer-events', 'none')
      this.defs
        .append('mask')
        .attr('id', `scan-mask-${this.id}`)
        .call((selector) => {
          targets.nodes().forEach((item) => {
            selector.node()?.appendChild(
              select(item)
                .clone(false)
                .attr('fill', scope === 'stroke' ? 'black' : 'white')
                .attr('stroke', scope === 'fill' ? 'black' : 'white')
                .node()
            )
          })
        })
    }

    if (!isSC(targets) && isCC(context)) {
      const [top, right, bottom, left] = context.canvas?.padding ?? [0, 0, 0, 0]
      this.gradientNode = createCanvasGradient({direction, color, opacity})
      this.maskNode = new fabric.Rect({
        top,
        left,
        width: context.canvas!.width! - left - right,
        height: context.canvas!.height! - top - bottom,
        fill: this.gradientNode,
        absolutePositioned: true,
        evented: false,
      })
      context.addWithUpdate(this.maskNode)
      targets?.[0]?.group?.group?.clone((cloned: fabric.Group) => {
        ;(this.maskNode as Rect).clipPath = cloned
      })
    }
  }

  play() {
    const {context, delay, duration, easing, direction = 'top'} = this.options,
      isLeftOrTop = direction === 'left' || direction === 'top',
      attributes = getAttributes(direction),
      configs: AnimeParams = {
        duration,
        delay,
        update: this.process,
        loopBegin: this.start,
        loopComplete: this.end,
        easing,
      }

    if (isSC(context) && isSC(this.gradientNode)) {
      configs.targets = this.gradientNode.node()
      if (attributes.length === 2) {
        configs[attributes[0]] = isLeftOrTop ? ['100%', '-100%'] : ['-100%', '100%']
        configs[attributes[1]] = isLeftOrTop ? ['200%', '0%'] : ['0%', '200%']
      } else if (attributes.length === 1) {
        configs['r'] = direction === 'inner' ? ['300%', '0%'] : ['0%', '300%']
      }
    }

    if (isCC(context) && !isSC(this.gradientNode)) {
      const coords = cloneDeep(this.gradientNode?.coords ?? {})

      configs.targets = coords
      configs.update = (...args) => {
        this.process(...args)
        if (
          this.gradientNode &&
          !isSC(this.gradientNode) &&
          !isSC(this.maskNode) &&
          this.maskNode?.clipPath
        ) {
          this.gradientNode.coords = coords
          this.maskNode?.drawClipPathOnCache(this.getCanvasContext()!)
          this.renderCanvas()
        }
      }

      if (attributes.length === 2) {
        configs[attributes[0]] = isLeftOrTop ? [1, -1] : [-1, 1]
        configs[attributes[1]] = isLeftOrTop ? [2, 0] : [0, 2]
      } else if (attributes.length === 1) {
        configs['r1'] = 0
        configs['r2'] = direction === 'inner' ? [3, 0] : [0, 3]
      }
    }

    anime(configs)
  }

  destroy() {
    const {targets} = this.options

    if (isSC(targets)) {
      this.defs?.remove()
      isSC(this.maskNode) && this.maskNode.remove()
    } else if (this.maskNode && !isSC(this.maskNode)) {
      this.maskNode.clipPath = undefined
      this.maskNode.group?.remove(this.maskNode)
    }

    this.defs = null
    this.maskNode = null
    this.gradientNode = null
  }
}
