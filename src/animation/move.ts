import {AnimationBase} from './base'
import {isSvgContainer, safeTransform} from '../utils'
import {canvasEasing, svgEasing} from './easing'
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
  targets.attr('transform', safeTransform(selection.attr('transform'), 'translateX', translate[0]))
  targets.attr('transform', safeTransform(selection.attr('transform'), 'translateY', translate[1]))
}

export class AnimationMove extends AnimationBase<Options> {
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
      easing = 'easeInOutSine',
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
        .ease(svgEasing.get(easing)!)
        .on('start', this.start)
        .on('end', this.end)
        .call(addTransformForSvgContainer, targets, endOffset)
    } else if (targets) {
      setTimeout(() => {
        setTimeout(this.end, duration)
        this.start()

        targets.forEach((target) => {
          target.animate('left', endOffset[0], {
            duration,
            onChange: this.renderCanvas,
            from: (target.left ?? 0) - initialOffset[0] + startOffset[0],
          })
          target.animate('top', endOffset[0], {
            duration,
            easing: canvasEasing.get(easing),
            onChange: this.renderCanvas,
            from: (target.top ?? 0) - initialOffset[1] + startOffset[1],
          })
        })
      }, delay)
    }
  }
}
