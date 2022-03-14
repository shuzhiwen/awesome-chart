import {AnimationBase} from '.'
import {createEvent, createLog, isSvgContainer, safeTransform} from '../utils'
import {
  AnimationMoveOptions as Options,
  AnimationProps as Props,
  D3Selection,
  D3Transition,
} from '../types'

const addTransformForSvgContainer = (
  targets: D3Selection | D3Transition,
  selection: D3Selection,
  translate: [number, number]
) => {
  targets.attr(
    'transform',
    safeTransform(selection.attr('transform'), 'translate', `${translate[0]},${translate[1]}`)
  )
}

export class AnimationMove extends AnimationBase<Options> {
  readonly log = createLog('animation:move', AnimationMove.name)

  readonly event = createEvent('animation:move')

  constructor(props: Props<Options>) {
    super(props)
  }

  init() {
    const {targets, initialOffset = [0, 0]} = this.options

    if (isSvgContainer(targets)) {
      targets.call(addTransformForSvgContainer, targets, initialOffset)
    } else if (targets) {
      targets.forEach((target) => {
        target.left = (target.left ?? 0) + initialOffset[0]
        target.top = (target.top ?? 0) + initialOffset[1]
      })
      this.renderCanvas()
    }
  }

  play() {
    const {
      targets,
      delay = 0,
      duration = 1000,
      initialOffset = [0, 0],
      startOffset = [0, 0],
      endOffset = [0, 0],
    } = this.options

    if (isSvgContainer(targets)) {
      targets
        .transition()
        .delay(delay)
        .duration(0)
        .call(addTransformForSvgContainer, targets, startOffset)
        .transition()
        .duration(duration)
        .on('start', this.start)
        .on('end', this.end)
        .call(addTransformForSvgContainer, targets, endOffset)
    } else if (targets) {
      setTimeout(() => {
        this.start()
        targets.forEach((target) => {
          target.animate('left', endOffset[0], {
            duration,
            onChange: this.renderCanvas,
            from: (target.left ?? 0) - initialOffset[0] + startOffset[0],
          })
          target.animate('top', endOffset[0], {
            duration,
            onChange: this.renderCanvas,
            from: (target.top ?? 0) - initialOffset[1] + startOffset[1],
          })
        })
        setTimeout(this.end, duration)
      }, delay)
    }
  }

  end() {
    this.options.loop && this.play()
  }
}
