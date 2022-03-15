import {throttle, merge, noop} from 'lodash'
import {Log, Event, AnimationProps as Props, BasicAnimationOptions as Options} from '../types'
import {
  ANIMATION_LIFE_CYCLES,
  createEvent,
  createLog,
  isCanvasContainer,
  isSvgContainer,
  noChange,
  uuid,
} from '../utils'

export abstract class AnimationBase<T extends Options> {
  readonly log: Log

  readonly event: Event

  readonly options

  protected id = uuid()

  protected renderCanvas = noop

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

  constructor({options, context}: Props<T>) {
    this.log = createLog(this.constructor.name)
    this.event = createEvent(this.constructor.name)
    this.options = merge({}, options, {context})
    this.createTargets('targets', context)

    if (isCanvasContainer(context)) {
      this.renderCanvas = context.requestRenderAll.bind(context)
    }

    ANIMATION_LIFE_CYCLES.forEach((name) => {
      const instance = this
      const fn = instance[name] || noChange

      instance[name] = (...parameter) => {
        try {
          if (name === 'init' && instance._isInitialized) {
            instance.log.warn('the animation is already initialized!')
            return
          } else if (name === 'play') {
            if (!instance._isAnimationAvailable) {
              instance.log.warn('the animation is not available!')
              return
            }
            if (instance._isAnimationStarted) {
              instance.log.warn('the animation is already started!')
              return
            }
            if (!instance.isInitialized) {
              instance.init()
            }
          }

          fn.call(instance, ...parameter)
          instance.event.fire(name, {...parameter})

          if (name === 'init') {
            this._isInitialized = true
            this._isAnimationAvailable = true
          } else if (name === 'start') {
            instance._isAnimationStarted = true
          } else if (name === 'end') {
            instance._isAnimationStarted = false
          } else if (name === 'destroy') {
            this._isAnimationAvailable = false
            this._isInitialized = false
          }
        } catch (error) {
          instance.log.error('animation life cycle call exception', error)
        }
      }

      instance.init = throttle(instance.init, 100)
      instance.play = throttle(instance.play, 100)
      instance.destroy = throttle(instance.destroy, 100)
    })
  }

  protected createTargets(key: string, context: Props<T>['context']) {
    const targets = this.options[key as 'targets']

    if (typeof targets === 'string') {
      if (isSvgContainer(context)) {
        merge(this.options, {className: targets, [key]: context.selectAll(targets)})
      } else if (isCanvasContainer(context)) {
        merge(this.options, {className: targets, [key]: context.getObjects()})
      }
    } else {
      merge(this.options, {[key]: targets})
    }
  }
}
