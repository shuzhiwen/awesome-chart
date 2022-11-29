import {isFunction, isNil} from 'lodash'
import {EventCallback} from '../types'
import {group} from './chaos'
import {uuid} from './random'

const isCallback = (fn: unknown): fn is EventCallback => isFunction(fn)

export class EventManager<
  Key extends string = string,
  Category extends string = string,
  Callback extends EventCallback = EventCallback
> {
  private key: string

  private cache: Record<string, Callback[]> = {}

  constructor(key: string) {
    this.key = `__event_${key}_${uuid()}`
  }

  private rename(name: Key) {
    return `${this.key}_${name}`
  }

  /**
   * Has event listener or not.
   * @param name
   * The event name.
   * @eventProperty
   */
  has(name: Key) {
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
  onWithOff(name: Key, category: Category, fn: Callback) {
    this.off(name, category)
    this.on(name, category, fn)
  }

  /**
   * Register listener for specific event.
   * @param name
   * The event name.
   * @param category
   * The event category that used to distinguish event sources.
   * @param fn
   * The listener instance.
   * @eventProperty
   */
  on(name: Key, category: Category, fn: Callback) {
    const prefixedName = this.rename(name)
    this.cache[prefixedName] = this.cache[prefixedName] || []
    this.cache[prefixedName].push(fn)
    fn.category = category
  }

  /**
   * Register listener that will be destroy after fire.
   * @param name
   * The event name.
   * @param category
   * The event category that used to distinguish event sources.
   * @param fn
   * The listener instance.
   * @eventProperty
   */
  once(name: Key, category: Category, fn: Callback) {
    const prefixedName = this.rename(name)
    this.cache[prefixedName] = this.cache[prefixedName] || []
    this.cache[prefixedName].push(fn)
    fn.category = category
    fn.isOnceDone = false
  }

  /**
   * Unregister listener for specific event.
   * @param name
   * The event name.
   * @param category
   * The event category that used to distinguish event sources.
   * @param fn
   * The listener instance.
   * @eventProperty
   */
  off(name: Key): void
  off(name: Key, fn: Callback): void
  off(name: Key, category: Category): void
  off(name: Key, input?: Callback | Category): void {
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
  fire(name: Key, args?: unknown, context?: unknown) {
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
