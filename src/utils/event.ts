import {isFunction, isNil} from 'lodash'
import {EventCallback} from '../types'
import {group} from './chaos'
import {uuid} from './random'

const methods = ['on', 'once', 'off', 'onWithOff', 'fire'] as const

const isCallback = (fn: unknown): fn is EventCallback => isFunction(fn)

export class EventManager<
  Name extends string = string,
  Category extends string = string,
  Callback extends EventCallback = EventCallback
> {
  /**
   * The key of the event, used to generate the ID.
   */
  private key: string

  /**
   * All active listener functions.
   */
  private cache: Record<string, Callback[]> = {}

  constructor(key: string) {
    this.key = `__event_${key}_${uuid()}`
  }

  private rename(name: Name) {
    return `${this.key}_${name}`
  }

  /**
   * Has event listener or not.
   * @param name
   * The event name.
   * @eventProperty
   */
  has(name: Name) {
    return !!this.cache[this.rename(name)]
  }

  /**
   * Syntax sugar for off and on.
   * @param name
   * The event name.
   * @param category
   * The event category that used to distinguish event sources.
   * @param fn
   * The listener instance.
   * @eventProperty
   */
  onWithOff(name: Name, category: Category, fn: Callback) {
    this.off(name, category)
    this.on(name, category, fn)
  }

  /**
   * Register listener for specific event.
   * @see onWithOff
   */
  on(name: Name, category: Category, fn: Callback) {
    const prefixedName = this.rename(name)
    this.cache[prefixedName] = this.cache[prefixedName] || []
    this.cache[prefixedName].push(fn)
    fn.category = category
  }

  /**
   * Register listener that will be destroy after fire.
   * @see onWithOff
   */
  once(name: Name, category: Category, fn: Callback) {
    const prefixedName = this.rename(name)
    this.cache[prefixedName] = this.cache[prefixedName] || []
    this.cache[prefixedName].push(fn)
    fn.category = category
    fn.isOnceDone = false
  }

  /**
   * Unregister listener for specific event.
   * @see onWithOff
   */
  off(name: Name): void
  off(name: Name, fn: Callback): void
  off(name: Name, category: Category): void
  off(name: Name, input?: Callback | Category): void {
    const prefixedName = this.rename(name)
    const fns = this.cache[prefixedName] || []

    if (!input) {
      delete this.cache[prefixedName]
    } else if (isCallback(input)) {
      fns.splice(fns.indexOf(input), 1)
    } else {
      this.cache[prefixedName] = fns.filter(({category}) => category !== input)
    }

    if (!this.cache[prefixedName] || !this.cache[prefixedName].length) {
      delete this.cache[prefixedName]
    }
  }

  /**
   * Trigger registered listeners.
   * @param name
   * The event name.
   * @param args
   * The arguments for listener.
   * @param context
   * The context for listener.
   * @eventProperty
   */
  fire(name: Name, args?: unknown, context?: unknown) {
    group(this.cache[this.rename(name)]).forEach((fn) => {
      if (isNil(fn.isOnceDone)) {
        fn.apply(context || null, group(args))
      } else if (fn.isOnceDone === false) {
        fn.apply(context || null, group(args))
        fn.isOnceDone = true
      }
    })
  }
}

/**
 * Replay the events of the source on the target.
 * @param target
 * The target `EventManager`.
 * @param sources
 * The group of `EventManager`.
 * @param filter
 * Only the name that meet the conditions can be triggered in a chain.
 * @remarks
 * Note that source-related events cannot be triggered on the target,
 * otherwise it will fall into an infinite loop.
 */
export function bindEventManager(
  target: EventManager,
  sources: EventManager[],
  filter: (name: string) => boolean
) {
  methods.forEach((method) => {
    sources.forEach((source) => {
      const origin = source[method]
      source[method] = (...args: any) => {
        origin.call(source, ...(args as [any, any, any]))
        if (filter(args[0])) {
          target[method].call(target, ...(args as [any, any, any]))
        }
      }
    })
  })
}
