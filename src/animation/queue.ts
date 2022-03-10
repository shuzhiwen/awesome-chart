import {createEvent, createLog, range, uuid} from '../utils'
import {AnimationBase, AnimationEmpty, animationMapping} from '.'
import {max} from 'lodash'
import {
  AnimationType,
  AnimationProps as Props,
  BasicAnimationOptions as Options,
  DrawerTarget,
} from '../types'

type Shape = AnimationBase<Options>

export class AnimationQueue extends AnimationBase<Options> {
  readonly log = createLog('animation:queue')

  readonly event = createEvent('animation:queue')

  private isReady = false

  private queue: Shape[]

  constructor({options, context}: Props<Options>) {
    super({options, context})
    const animationHead = new AnimationEmpty({})

    animationHead.event.on('start', () => this.start())
    animationHead.event.on('end', () => this.end())
    this.queue = [animationHead]
  }

  private bind(animations: Shape[], callback: Function) {
    let completeCount = 0
    animations.forEach((instance) => {
      instance.event.on('end', () => {
        if (++completeCount === animations.length) {
          // reset count and run the callback
          completeCount = 0
          callback()
        }
      })
    })
    return animations
  }

  connect(priorityConfig?: number[] | Function) {
    this.queue.forEach((instance) => {
      instance.event.off('start')
      instance.event.off('end')
    })

    let finalPriority: number[]
    if (Array.isArray(priorityConfig)) {
      finalPriority = [0, ...priorityConfig]
    } else if (typeof priorityConfig === 'function') {
      finalPriority = [0, ...priorityConfig(this.queue.slice(1))]
    } else {
      finalPriority = this.queue.map((_, index) => index)
    }

    // group animations by priority config
    const groupedQueue: Shape[][] = range(0, max(finalPriority)!).map(() => [])
    finalPriority.forEach((priority, animationIndex) => {
      groupedQueue[priority].push(this.queue[animationIndex])
    })

    groupedQueue.reduce((previousAnimations, currentAnimations, priority) => {
      currentAnimations.forEach((animation) => {
        const mapToState = (state: string) => ({id: animation.options.id, priority, state})
        const [startState, processState, endState] = ['start', 'process', 'end'].map(mapToState)

        animation.event.on('start', () => this.process(startState))
        animation.event.on('process', (data: any) => this.process({...processState, data}))
        animation.event.on('end', () => this.process(endState))
      })

      if (priority === Math.max(...finalPriority)) this.bind(currentAnimations, () => this.end())
      this.bind(previousAnimations, () => currentAnimations.forEach((instance) => instance.play()))

      return currentAnimations
    })

    this.isReady = true
  }

  push(type: AnimationType, options: Options | AnimationQueue, context: Maybe<DrawerTarget>) {
    if (type === 'queue') {
      this.queue.push(options as AnimationQueue)
    } else if (!animationMapping[type]) {
      this.log.error('animation type error', type)
    } else {
      this.queue.push(
        new animationMapping[type]({
          options: {...(options as any), loop: false},
          context,
        })
      )
    }

    if (!this.queue[this.queue.length - 1].options.id) {
      this.queue[this.queue.length - 1].options.id = uuid()
    }

    this.isReady = false
  }

  remove(id: string) {
    const index = this.queue.findIndex(({options}) => options.id === id)

    if (index !== -1) {
      this.isReady = false
      return this.queue.splice(index, 1)
    } else {
      this.log.error('the animation does not exist', id)
    }
  }

  play() {
    if (!this.isReady && this.queue.length > 1) {
      this.connect()
    }
    this.queue[0].play()
  }

  end() {
    if (this.isAnimationAvailable && this.options.loop && this.queue.length > 1) {
      this.queue.forEach((instance) => {
        instance.destroy()
        instance.init()
      })
      this.play()
    }
  }

  destroy() {
    while (this.queue.length > 1) {
      const instance = this.queue.pop()
      instance?.isAnimationAvailable && instance.destroy()
    }
  }
}
