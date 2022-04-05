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
    const {targets, context} = this.options

    if (isSvgContainer(targets) && isSvgContainer(context)) {
      this.defs = context.append('defs')
      this.defs
        .append('clipPath')
        .attr('id', `erase-${this.id}`)
        .append('rect')
        .attr('x', '0%')
        .attr('y', '0%')
        .attr('width', '100%')
        .attr('height', '100%')
      targets.attr('clip-path', `url(#erase-${this.id})`)
    } else if (!isSvgContainer(targets)) {
      targets?.forEach(
        (object) =>
          (object.clipPath = new fabric.Rect({
            left: -(object.left ?? 0) - (object.width ?? 0) / 2,
            top: -(object.top ?? 0) - (object.height ?? 0) / 2,
            width: object.canvas?.width ?? 0,
            height: object.canvas?.height ?? 0,
          }))
      )
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
        .attr('x', '0%')
        .attr('y', '0%')
        .attr('width', '100%')
        .attr('height', '100%')
        .transition()
        .duration(duration)
        .ease(svgEasing.get(easing)!)
        .on('start', this.start)
        .on('end', this.end)
        .attr('x', direction !== 'right' ? '0%' : '100%')
        .attr('y', direction !== 'bottom' ? '0%' : '100%')
        .attr('width', direction === 'left' || direction === 'right' ? '0%' : '100%')
        .attr('height', direction === 'top' || direction === 'bottom' ? '0%' : '100%')
    } else if (isCanvasContainer(context) && !isSvgContainer(targets) && targets) {
      transition()
        .delay(delay)
        .duration(duration)
        .on('end', this.end)
        .on('start', () => {
          this.start()
          targets.forEach((target) => {
            const {left = 0, top = 0, width = 0, height = 0} = target.clipPath!
            target.clipPath?.animate(
              {
                left: direction !== 'right' ? left : left + width,
                top: direction !== 'bottom' ? top : top + height,
                width: direction === 'left' || direction === 'right' ? 0 : width,
                height: direction === 'top' || direction === 'bottom' ? 0 : height,
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
}
