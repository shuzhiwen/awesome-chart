import {max} from 'lodash'
import {range, uuid} from '../utils'
import {AnimationBase} from './base'
import {AnimationEmpty} from './empty'
import {animationMapping} from '.'
import {AnimationType, DrawerTarget, BasicAnimationOptions as Options} from '../types'

type Shape = AnimationBase<Options>

const animationKey = `animationKey-${new Date().getTime()}`

const bind = (animations: Shape[], callback: AnyFunction) => {
  Promise.all(
    animations.map(
      (instance) =>
        new Promise((resolve) => {
          instance.event.onWithOff('end', animationKey, resolve)
        })
    )
  ).then(() => {
    bind(animations, callback)
    callback()
  })
}

export class AnimationQueue extends AnimationBase<Options> {
  private isConnected = false

  private queue: Shape[]

  constructor({options}: {options: {loop: boolean}}) {
    super({options: options as Options})
    const animationHead = new AnimationEmpty({})

    animationHead.event.on('start', this.start)
    animationHead.event.on('end', this.end)
    this.queue = [animationHead]
  }

  connect(priorityConfig?: number[] | ((queues: Shape[]) => number[])) {
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
        const [startState, processState, endState] = ['start', 'process', 'end'].map(
          (state: string) => ({id: animation.options.id, priority, state})
        )

        animation.event.on('start', () => this.process(startState))
        animation.event.on('process', (data: any) => this.process({...processState, data}))
        animation.event.on('end', () => this.process(endState))
      })

      if (priority === Math.max(...finalPriority)) {
        bind(currentAnimations, () => this.end())
      }

      bind(previousAnimations, () => {
        currentAnimations.forEach((instance) => instance.play())
      })

      return currentAnimations
    })

    this.isConnected = true
  }

  pushQueue(options: AnimationQueue) {
    this.queue.push(options)
    this.isConnected = false
  }

  pushAnimation(type: AnimationType, options: Options, context: DrawerTarget) {
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

  play() {
    if (!this.isConnected && this.queue.length > 1) {
      this.connect()
    }
    this.queue.at(0)?.play()
    this.event.fire('start')
  }

  end() {
    if (this.isAnimationAvailable && this.options.loop && this.queue.length > 1) {
      this.queue.forEach((instance) => instance.destroy())
      this.queue.forEach((instance) => instance.init())
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
