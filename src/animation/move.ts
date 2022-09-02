import {AnimationBase} from './base'
import {isSvgCntr} from '../utils'
import {canvasEasing} from './easing'
import {AnimationMoveOptions as Options, AnimationProps as Props} from '../types'
import anime from 'animejs'

export class AnimationMove extends AnimationBase<Options> {
  constructor(props: Props<Options>) {
    super(props)
  }

  init() {
    const {targets, initialOffset = [0, 0]} = this.options

    if (isSvgCntr(targets)) {
      anime({
        targets,
        translateX: initialOffset[0],
        translateY: initialOffset[1],
        duration: 0,
        delay: 0,
      })
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
      delay,
      duration,
      easing,
      mode = 'normal',
      initialOffset = [0, 0],
      startOffset = [0, 0],
      endOffset = [0, 0],
    } = this.options

    if (isSvgCntr(targets)) {
      anime({
        targets: targets.nodes(),
        duration,
        delay,
        easing,
        direction: mode === 'alternate' ? 'normal' : mode,
        loopBegin: this.start,
        loopComplete: this.end,
        translateX: [startOffset[0], endOffset[0]].concat(
          mode === 'alternate' ? [startOffset[0]] : []
        ),
        translateY: [startOffset[1], endOffset[1]].concat(
          mode === 'alternate' ? [startOffset[1]] : []
        ),
      })
    }

    if (targets && !isSvgCntr(targets)) {
      setTimeout(() => {
        setTimeout(this.end, duration)
        this.start()

        targets.forEach((target) => {
          target.animate('left', endOffset[0], {
            duration,
            onChange: this.renderCanvas,
            from: (target.left ?? 0) - initialOffset[0] + startOffset[0],
          })
          target.animate('top', endOffset[1], {
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
