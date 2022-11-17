import {isFunction, isNil, isString} from 'lodash'
import {EventCallback} from '../types'
import {group} from './chaos'
import {uuid} from './random'

const isCallback = (fn: unknown): fn is EventCallback => isFunction(fn)

export function createEvent<
  Key extends string = string,
  Category extends string = string,
  Callback extends EventCallback = EventCallback
>(key: string) {
  const id = `__event-${key}-${uuid()}`
  const rename = (name: Key) => `${id}-${name}`
  const cache: Record<string, Callback[]> = {}

  return {
    get cache() {
      return cache
    },

    /**
     * Has event listener or not.
     * @param name
     * The event name.
     * @eventProperty
     */
    has(name: Key) {
      return !!cache[rename(name)]
    },

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
      this.off(name, fn, category)
      this.on(name, fn, category)
    },

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
    on(name: Key, fn: Callback, category?: Category) {
      if (isString(name) && isCallback(fn)) {
        const prefixedName = rename(name)
        cache[prefixedName] = cache[prefixedName] || []
        fn.category = category
        cache[prefixedName].push(fn)
      }
    },

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
    once(name: Key, fn: Callback, category?: Category) {
      if (isString(name) && isCallback(fn)) {
        const prefixedName = rename(name)
        cache[prefixedName] = cache[prefixedName] || []
        fn.category = category
        fn.isOnceDone = false
        cache[prefixedName].push(fn)
      }
    },

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
    off(name: Key, fn?: Callback, category?: Category) {
      const prefixedName = rename(name)
      const fns = cache[prefixedName] || []
      if (!fn && !category) {
        delete cache[prefixedName]
      } else if (category) {
        cache[prefixedName] = fns.filter((item) => item.category !== category)
      } else if (fn) {
        fns.splice(fns.indexOf(fn), 1)
      }
      if (!cache[prefixedName]) {
        delete cache[prefixedName]
      }
    },

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
      const fns = cache[rename(name)] || []
      fns.forEach((fn) => {
        if (isNil(fn.isOnceDone)) {
          fn.apply(context || null, group(args))
        } else if (fn.isOnceDone === false) {
          fn.apply(context || null, group(args))
          fn.isOnceDone = true
        }
      })
    },
  }
}
