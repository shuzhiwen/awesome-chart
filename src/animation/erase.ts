import {AnimationBase} from '.'
import {createEvent, createLog, isCanvasContainer, isSvgContainer} from '../utils'
import {AnimationEraseOptions as Options, AnimationProps as Props, D3Selection} from '../types'
import {Object} from 'fabric/fabric-impl'
import {fabric} from 'fabric'

const createGradient = (parentNode: D3Selection | Object, id: string) => {
  if (isSvgContainer(parentNode)) {
    parentNode
      .append('clipPath')
      .attr('id', `erase-${id}`)
      .append('rect')
      .attr('x', '0%')
      .attr('y', '0%')
      .attr('width', '100%')
      .attr('height', '100%')
  } else {
    parentNode.clipPath = new fabric.Rect({
      left: -(parentNode.left ?? 0) - (parentNode.width ?? 0) / 2,
      top: -(parentNode.top ?? 0) - (parentNode.height ?? 0) / 2,
      width: parentNode.canvas?.width ?? 0,
      height: parentNode.canvas?.height ?? 0,
    })
  }
}

export class AnimationErase extends AnimationBase<Options> {
  readonly log = createLog('animation:erase', AnimationErase.name)

  readonly event = createEvent('animation:erase')

  private defs: Maybe<D3Selection>

  constructor(props: Props<Options>) {
    super(props)
  }

  init() {
    const {targets, context} = this.options

    if (isSvgContainer(targets) && isSvgContainer(context)) {
      this.defs = context.append('defs')
      createGradient(this.defs, this.id)
      targets.attr('clip-path', `url(#erase-${this.id})`)
    } else if (!isSvgContainer(targets)) {
      targets?.forEach((object) => createGradient(object, this.id))
      this.renderCanvas()
    }
  }

  play() {
    const {targets, context, delay = 0, duration = 1000, direction = 'right'} = this.options

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
        .on('start', this.start)
        .on('end', this.end)
        .attr('x', direction !== 'right' ? '0%' : '100%')
        .attr('y', direction !== 'bottom' ? '0%' : '100%')
        .attr('width', direction === 'left' || direction === 'right' ? '0%' : '100%')
        .attr('height', direction === 'top' || direction === 'bottom' ? '0%' : '100%')
    } else if (isCanvasContainer(context) && !isSvgContainer(targets) && targets) {
      setTimeout(() => {
        setTimeout(this.end, duration)
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
              onChange: () => {
                target.drawClipPathOnCache(context.toCanvasElement().getContext('2d')!)
                this.renderCanvas()
              },
            }
          )
        })
      }, delay)
    }
  }

  end() {
    this.options.loop && this.play()
  }
}
