import {AnimationBase} from './base'
import {isCanvasCntr, isSvgCntr} from '../utils'
import {AnimationMoveOptions, AnimationProps} from '../types'
import anime from 'animejs'
import {noop} from 'lodash'

export class AnimationMove extends AnimationBase<AnimationMoveOptions> {
  constructor(props: AnimationProps<AnimationMoveOptions>) {
    super(props)
  }

  init() {
    const {targets, initialOffset = [0, 0]} = this.options

    if (isSvgCntr(targets)) {
      anime({
        targets: targets.nodes(),
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
      context,
      targets,
      delay,
      duration,
      easing,
      alternate,
      stagger = null,
      decayFactor = 1,
      startOffset = [0, 0],
      endOffset = [0, 0],
    } = this.options
    const nodes = isSvgCntr(targets) ? targets.nodes() : targets!
    const attrs = isSvgCntr(targets) ? ['translateX', 'translateY'] : ['left', 'top']

    nodes.forEach((node, i, array) => {
      anime({
        targets: node,
        easing,
        duration,
        loopBegin: i === 0 ? this.start : noop,
        loopComplete: i === array.length - 1 ? this.end : noop,
        update: (...args) => {
          this.process(...args)
          if (isCanvasCntr(context)) {
            this.renderCanvas()
          }
        },
        keyframes: [
          {
            [attrs[0]]: startOffset[0],
            [attrs[1]]: startOffset[1],
            duration: 0,
            delay: 0,
          },
          {
            [attrs[0]]: endOffset[0] * Math.pow(decayFactor, i),
            [attrs[1]]: endOffset[1] * Math.pow(decayFactor, i),
            delay: stagger ? stagger * i : delay,
          },
          alternate
            ? {
                [attrs[0]]: startOffset[0],
                [attrs[1]]: startOffset[1],
                delay: 0,
              }
            : {
                duration: 0,
                delay: 0,
              },
        ],
      })
    })
  }
}
