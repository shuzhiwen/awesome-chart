import {max, range} from 'd3'
import {animationMapping} from '.'
import {safeLoop, uuid} from '../utils'
import {AnimationType, DrawerTarget, AnimationOptions} from '../types'
import {AnimationEmpty} from './empty'
import {AnimationBase} from './base'

type Animation = AnimationBase<AnimationOptions>

const bindKey = `bindKey-${new Date().getTime()}`
const eventKey = `eventKey-${new Date().getTime()}`

const bind = (animations: Animation[], callback: AnyFunction) => {
  Promise.all(
    animations.map(
      (instance) =>
        new Promise((resolve) => {
          instance.event.onWithOff('end', bindKey, resolve)
        })
    )
  ).then(() => {
    bind(animations, callback)
    callback()
  })
}

export class AnimationQueue extends AnimationBase<AnimationOptions> {
  readonly queue: Animation[]

  private isConnected = false

  constructor(options: AnimationOptions) {
    super({options})
    const animationHead = new AnimationEmpty({})

    animationHead.event.onWithOff('start', eventKey, this.start)
    animationHead.event.onWithOff('end', eventKey, this.end)
    this.queue = [animationHead]
  }

  connect(priorityConfig?: number[] | ((queues: Animation[]) => number[])) {
    this.queue.forEach((instance) => {
      instance.event.off('start', eventKey)
      instance.event.off('end', eventKey)
    })

    let finalPriorities: number[]
    if (Array.isArray(priorityConfig)) {
      finalPriorities = [0, ...priorityConfig]
    } else if (typeof priorityConfig === 'function') {
      finalPriorities = [0, ...priorityConfig(this.queue.slice(1))]
    } else {
      finalPriorities = this.queue.map((_, index) => index)
    }

    const maxPriority = max(finalPriorities)!
    // group animations by priority config
    const groupedQueue: Animation[][] = range(0, maxPriority + 1).map(() => [])

    finalPriorities.forEach((priority, animationIndex) => {
      groupedQueue[priority].push(this.queue[animationIndex])
    })

    groupedQueue.reduce((previousAnimations, currentAnimations, priority) => {
      currentAnimations.forEach((animation) => {
        const [startState, processState, endState] = ['start', 'process', 'end'].map(
          (state: string) => ({id: animation.options.id, priority, state})
        )

        animation.event.onWithOff('start', eventKey, () => this.process(startState))
        animation.event.onWithOff('end', eventKey, () => this.process(endState))
        animation.event.onWithOff('process', eventKey, (data) =>
          this.process({...processState, data})
        )
      })

      if (priority === maxPriority) {
        bind(currentAnimations, () => this.end())
      }

      bind(previousAnimations, () => {
        currentAnimations.forEach((instance) => instance.play())
      })

      return currentAnimations
    })

    this.isConnected = true
  }

  pushQueue(queue: AnimationQueue) {
    this.queue.push(queue)
    this.isConnected = false
  }

  pushAnimation(type: AnimationType, options: AnimationOptions, context: DrawerTarget) {
    if (!animationMapping[type]) {
      this.log.error('Animation type error', type)
      return
    }

    this.isConnected = false
    this.queue.push(
      new animationMapping[type]({
        options: {id: uuid(), ...options} as never,
        context,
      })
    )
  }

  remove(id: string) {
    const index = this.queue.findIndex(({options}) => options.id === id)

    if (index !== -1) {
      this.isConnected = false
      return this.queue.splice(index, 1)
    } else {
      this.log.error('The animation does not exist', id)
    }
  }

  init() {
    if (this.queue.length > 1) {
      this.queue[1].init()
    }
  }

  play() {
    if (!this.isConnected && this.queue.length > 1) {
      this.connect()
    }
    this.queue[0].play()
    this.event.fire('start')
  }

  end() {
    if (this.isAvailable && this.options.loop && this.queue.length > 1) {
      this.queue.forEach((instance) => instance.destroy())
      this.queue.forEach((instance) => instance.init())
      this.play()
    }
  }

  destroy() {
    safeLoop(
      () => this.queue.length > 1,
      () => {
        const instance = this.queue.pop()
        instance?.isAvailable && instance.destroy()
      }
    )
  }
}
