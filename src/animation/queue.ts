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
    super({defaultOptions: {loop: false}, options, context})
    // initialize animation queue
    const animationHead = new AnimationEmpty({})
    // queue must has a head animation
    animationHead.event.on('start', () => this.start())
    animationHead.event.on('end', () => this.end())
    this.queue = [animationHead]
  }

  // run the callback after all animations done
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

  // discrete animations to sequence animations
  connect(priorityConfig?: number[] | Function) {
    // initialize life cycle
    this.queue.forEach((instance) => {
      instance.event.off('start')
      instance.event.off('end')
    })
    // default by index of array
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
    // connect the grouped animations except head
    groupedQueue.reduce((previousAnimations, currentAnimations, priority) => {
      // queue capture item's events
      currentAnimations.forEach((animation) => {
        const mapToState = (state: string) => ({id: animation.options.id, priority, state})
        const [startState, processState, endState] = ['start', 'process', 'end'].map(mapToState)
        animation.event.on('start', () => this.process(startState))
        animation.event.on('process', (data: any) => this.process({...processState, data}))
        animation.event.on('end', () => this.process(endState))
      })
      // last animations bind queue's 'end' event
      if (priority === Math.max(...finalPriority)) this.bind(currentAnimations, () => this.end())
      // previous animation group fire next animation group
      this.bind(previousAnimations, () => currentAnimations.forEach((instance) => instance.play()))
      return currentAnimations
    })
    // connect done
    this.isReady = true
    return this
  }

  push(
    type: AnimationType,
    options: Options | Function | AnimationQueue,
    context: Maybe<DrawerTarget>
  ) {
    // create new queue item by type
    if (type === 'function') {
      const animation = new AnimationEmpty({})
      animation.event.on('process', options as Function)
      this.queue.push(animation)
    } else if (type === 'queue') {
      this.queue.push(options as AnimationQueue)
    } else if (animationMapping[type]) {
      this.queue.push(
        new animationMapping[type]({
          options: {...options, loop: false},
          context,
        })
      )
    } else {
      this.log.error('animation type error', type)
      return null
    }
    // id is required
    if (!this.queue[this.queue.length - 1].options.id) {
      this.queue[this.queue.length - 1].options.id = uuid()
    }
    // create a animation lead to reconnect
    this.isReady = false
  }

  remove(id: string) {
    const index = this.queue.findIndex(({options}) => options.id === id)
    // remove a animation lead to reconnect
    if (index !== -1) {
      this.isReady = false
      return this.queue.splice(index, 1)
    } else {
      this.log.error('the animation does not exist', id)
    }
  }

  play() {
    !this.isReady && this.queue.length > 1 && this.connect()
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
