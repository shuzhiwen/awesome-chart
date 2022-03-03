import {merge} from 'lodash'
import {isSvgContainer, noChange, uuid} from '../utils'
import {
  Log,
  Event,
  AnimationLifeCycle as Life,
  AnimationBaseProps as Props,
  BasicAnimationOptions as Options,
} from '../types'

const lifeCycles: Life[] = ['init', 'play', 'start', 'process', 'end', 'destroy']

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

  init = (...args: any) => {
    return args
  }

  play(...args: any) {
    return args
  }

  start(...args: any) {
    return args
  }

  process(...args: any) {
    return args
  }

  end(...args: any) {
    return args
  }

  destroy(...args: any) {
    return args
  }

  constructor({defaultOptions, options, context}: Props<T>) {
    this.id = uuid()
    this.options = merge({}, defaultOptions, options, {context})
    this.createTargets('targets', context)

    // start catch error
    lifeCycles.forEach((name) => {
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
    })
  }

  // transform targets
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
