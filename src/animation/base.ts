import {debounce, merge} from 'lodash'
import {ANIMATION_LIFE_CYCLES, isSvgContainer, noChange, uuid} from '../utils'
import {Log, Event, AnimationBaseProps as Props, BasicAnimationOptions as Options} from '../types'

export abstract class AnimationBase<T extends Options> {
  abstract readonly log: Log

  abstract readonly event: Event

  readonly options

  protected id = uuid()

  protected instance: any

  protected _isInitialized = false

  protected _isAnimationStart = false

  protected _isAnimationAvailable = true

  get isInitialized() {
    return this._isInitialized
  }

  get isAnimationStart() {
    return this._isAnimationStart
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

  constructor({defaultOptions, options, context}: Props<T>) {
    this.id = uuid()
    this.options = merge({}, defaultOptions, options, {context})
    this.createTargets('targets', context)

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
            if (instance._isAnimationStart) {
              instance.log.warn('the animation is already started!')
              return
            }
          }

          fn.call(instance, ...parameter)
          instance.event.fire(name, {...parameter})

          if (name === 'init') {
            this._isInitialized = true
            this._isAnimationAvailable = true
          } else if (name === 'start') {
            instance._isAnimationStart = true
          } else if (name === 'end') {
            instance._isAnimationStart = false
          } else if (name === 'destroy') {
            this._isAnimationAvailable = false
          }
        } catch (error) {
          instance.log.error('animation life cycle call exception', error)
        }
      }

      instance.init = debounce(instance.init, 100)
      instance.play = debounce(instance.play, 100)
      instance.destroy = debounce(instance.destroy, 100)
    })
  }

  protected createTargets(key: string, context: Props<T>['context']) {
    const targets = this.options[key as 'targets']

    if (isSvgContainer(context)) {
      if (typeof targets === 'string') {
        merge(this.options, {className: targets, [key]: context.selectAll(targets).nodes()})
      } else {
        merge(this.options, {[key]: targets?.nodes()})
      }
    }
  }
}
