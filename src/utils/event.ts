import {isFunction, isNil} from 'lodash'
import {EventCallback} from '../types'
import {group} from './chaos'

const methods = ['on', 'once', 'off', 'onWithOff', 'fire'] as const

const isCallback = (fn: unknown): fn is EventCallback => isFunction(fn)

export class EventManager<
  Name extends string = string,
  Callback extends EventCallback = EventCallback
> {
  /**
   * All active listener functions.
   */
  private cache: Record<string, Callback[]> = {}

  /**
   * Has event listener or not.
   * @param name
   * The event name.
   * @eventProperty
   */
  has(name: Name) {
    return !!this.cache[name]
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
  onWithOff(name: Name, category: string, fn: Callback) {
    this.off(name, category)
    this.on(name, category, fn)
  }

  /**
   * Register listener for specific event.
   * @see onWithOff
   */
  on(name: Name, category: string, fn: Callback) {
    this.cache[name] = this.cache[name] || []
    this.cache[name].push(fn)
    fn.category = category
  }

  /**
   * Register listener that will be destroy after fire.
   * @see onWithOff
   */
  once(name: Name, category: string, fn: Callback) {
    this.cache[name] = this.cache[name] || []
    this.cache[name].push(fn)
    fn.category = category
    fn.isOnceDone = false
  }

  /**
   * Unregister listener for specific event.
   * @see onWithOff
   */
  off(name: Name): void
  off(name: Name, fn: Callback): void
  off(name: Name, category: string): void
  off(name: Name, input?: Callback | string): void {
    const fns = this.cache[name] || []

    if (!input) {
      delete this.cache[name]
    } else if (isCallback(input)) {
      fns.splice(fns.indexOf(input), 1)
    } else {
      this.cache[name] = fns.filter(({category}) => category !== input)
    }

    if (!this.cache[name] || !this.cache[name].length) {
      delete this.cache[name]
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
  fire(name: Name, ...args: Parameters<Callback>) {
    group(this.cache[name]).forEach((fn) => {
      if (isNil(fn.isOnceDone)) {
        fn.apply(null, group(args))
      } else if (fn.isOnceDone === false) {
        fn.apply(null, group(args))
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
