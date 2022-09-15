import {throttle, merge} from 'lodash'
import {selector} from '../layers'
import {AnimationProps, BasicAnimationOptions} from '../types'
import {animationLifeCycles, createEvent, createLog, isCanvasCntr, noChange, uuid} from '../utils'

export abstract class AnimationBase<T extends BasicAnimationOptions> {
  readonly log = createLog(this.constructor.name)

  readonly event = createEvent<SetKeys<typeof animationLifeCycles>>(this.constructor.name)

  readonly options

  protected id = uuid()

  protected _isInitialized = false

  protected _isAnimationStarted = false

  protected _isAnimationAvailable = true

  get isInitialized() {
    return this._isInitialized
  }

  get isAnimationStarted() {
    return this._isAnimationStarted
  }

  get isAnimationAvailable() {
    return this._isAnimationAvailable
  }

  protected start(...args: any) {
    return args
  }

  protected process(...args: any) {
    return args
  }

  protected end(...args: any) {
    this.options.loop && this._isAnimationAvailable && this.play()
    return args
  }

  init(...args: any) {
    return args
  }

  play(...args: any) {
    return args
  }

  destroy(...args: any) {
    return args
  }

  protected getCanvasContext = () => {
    if (isCanvasCntr(this.options.context)) {
      return this.options.context.toCanvasElement().getContext('2d')!
    }
  }

  protected renderCanvas = () => {
    if (isCanvasCntr(this.options.context)) {
      this.options.context.canvas?.requestRenderAll()
    }
  }

  constructor({options, context}: AnimationProps<T>) {
    this.options = merge({}, options, {context})
    this.createTargets('targets')

    animationLifeCycles.forEach((name) => {
      const fn = this[name] || noChange

      this[name] = (...parameter) => {
        try {
          if (name === 'init' && this._isInitialized) {
            this.log.warn('The animation is already initialized!')
            return
          } else if (name === 'play') {
            if (!this._isAnimationAvailable) {
              this.log.warn('The animation is not available!')
              return
            }
            if (this._isAnimationStarted) {
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
            this._isAnimationAvailable = true
          } else if (name === 'start') {
            this._isAnimationStarted = true
          } else if (name === 'end') {
            this._isAnimationStarted = false
          } else if (name === 'destroy') {
            this._isAnimationAvailable = false
            this._isInitialized = false
          }
        } catch (error) {
          this.log.error('Animation life cycle call exception', error)
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
      merge(this.options, {className: targets, [key]: selector.getChildren(context, targets)})
    } else {
      merge(this.options, {[key]: targets})
    }
  }
}
