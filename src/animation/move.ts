import anime from 'animejs'
import {noop} from 'lodash'
import {Graphics} from 'pixi.js'
import {AnimationMoveOptions, AnimationProps} from '../types'
import {isSC} from '../utils'
import {AnimationBase} from './base'

export class AnimationMove extends AnimationBase<AnimationMoveOptions> {
  private originPosition: Vec2[] = []

  constructor(props: AnimationProps<AnimationMoveOptions>) {
    super(props)
  }

  init() {
    const {targets, initialOffset = [0, 0]} = this.options

    if (isSC(targets)) {
      anime({
        targets: targets.nodes(),
        translateX: initialOffset[0],
        translateY: initialOffset[1],
        duration: 0,
        delay: 0,
      })
    } else if (targets) {
      targets.forEach((target) => {
        target.x += initialOffset[0]
        target.y += initialOffset[1]
        this.originPosition.push([target.x, target.y])
      })
    }
  }

  getRealPosition(targets: Graphics | HTMLElement, index: number) {
    if (targets instanceof Graphics) {
      return this.originPosition[index]
    }
    return [0, 0]
  }

  play() {
    const {
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
    const nodes = isSC(targets) ? (targets.nodes() as HTMLElement[]) : targets!
    const attrs = isSC(targets) ? ['translateX', 'translateY'] : ['x', 'y']

    nodes.forEach((targets, i, array) => {
      const [x, y] = this.getRealPosition(targets, i)
      anime({
        targets,
        easing,
        duration,
        update: this.process,
        loopBegin: i === 0 ? this.start : noop,
        loopComplete: i === array.length - 1 ? this.end : noop,
        keyframes: [
          {
            [attrs[0]]: x + startOffset[0],
            [attrs[1]]: y + startOffset[1],
            duration: 0,
            delay: 0,
          },
          {
            [attrs[0]]: x + endOffset[0] * Math.pow(decayFactor, i),
            [attrs[1]]: y + endOffset[1] * Math.pow(decayFactor, i),
            delay: stagger ? stagger * i : delay,
          },
          alternate
            ? {
                [attrs[0]]: x + startOffset[0],
                [attrs[1]]: y + startOffset[1],
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
