import {merge, throttle} from 'lodash'
import {Graphics} from 'pixi.js'
import {animationLifeCycles} from '../core'
import {selector} from '../layers'
import {BasicAnimationOptions} from '../types'
import {createLog, EventManager, isSC, noChange} from '../utils'

export abstract class AnimationBase<Options extends AnyObject = {}> {
  init() {}

  play() {}

  destroy() {}

  readonly log = createLog(this.constructor.name)

  readonly event = new EventManager<Keys<typeof animationLifeCycles>>()

  readonly options: Partial<BasicAnimationOptions & Options>

  protected _isInitialized = false

  protected _isStarted = false

  protected _isAvailable = true

  protected start(...args: any) {
    return args
  }

  protected process(...args: any) {
    return args
  }

  protected end(...args: any) {
    this.options.loop && this._isAvailable && this.play()
    return args
  }

  protected get basicConfig() {
    return {
      update: this.process,
      loopBegin: this.start,
      loopComplete: this.end,
      targets: this.options.targets,
      duration: this.options.duration,
      easing: this.options.easing,
      delay: this.options.delay,
    }
  }

  protected get canvasRoot() {
    if (isSC(this.options.targets)) {
      throw new Error('Wrong call with svg context')
    }

    return (this.options.targets![0] as Graphics).parent.parent
  }

  get isInitialized() {
    return this._isInitialized
  }

  get isStarted() {
    return this._isStarted
  }

  get isAvailable() {
    return this._isAvailable
  }

  constructor(options: AnimationBase<Options>['options']) {
    this.options = options
    this.createTargets('targets')

    animationLifeCycles.forEach((name) => {
      const fn = this[name] || noChange

      this[name] = (...parameter) => {
        try {
          if (name === 'init' && this._isInitialized) {
            this.log.warn('The animation is already initialized!')
            return
          } else if (name === 'play') {
            if (!this._isAvailable) {
              this.log.warn('The animation is not available!')
              return
            }
            if (this._isStarted) {
              this.log.warn('The animation is already started!')
              return
            }
            if (!this.isInitialized) {
              this.init()
            }
          }

          fn.call(this, ...parameter)
          this.event.fire(name, {...parameter})

          if (name === 'init') {
            this._isInitialized = true
            this._isAvailable = true
          } else if (name === 'start') {
            this._isStarted = true
          } else if (name === 'end') {
            this._isStarted = false
          } else if (name === 'destroy') {
            this._isAvailable = false
            this._isInitialized = false
          }
        } catch (error) {
          this.log.error(`🎃 ${name} 🎃 call exception`, error)
        }
      }

      this.init = throttle(this.init, 100)
      this.play = throttle(this.play, 100)
      this.destroy = throttle(this.destroy, 100)
    })
  }

  protected createTargets(key: string) {
    const targets = this.options[key as 'targets'],
      {context} = this.options

    if (typeof targets === 'string' && context) {
      merge(this.options, {
        className: targets,
        [key]: selector.getChildren(context, targets),
      })
    } else {
      merge(this.options, {[key]: targets})
    }
  }
}
