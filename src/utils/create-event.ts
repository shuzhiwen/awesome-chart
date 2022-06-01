import {isNil, isFunction, isString} from 'lodash'
import {group} from './chaos'
import {uuid} from './random'

type Callback = AnyFunction & {
  category?: string
  isOnceDone?: boolean
}

const isCallback = (fn: unknown): fn is Callback => isFunction(fn)

export function createEvent<T extends string = string, F extends string = string>(key: string) {
  const id = `__event-${key}-${uuid()}`
  const rename = (name: T) => `${id}-${name}`
  const cache: Record<string, Callback[]> = {}

  return {
    onWithOff(name: T, category: F, fn: Callback) {
      this.off(name, fn, category)
      this.on(name, fn, category)
    },

    on(name: T, fn: Callback, category?: F) {
      if (isString(name) && isCallback(fn)) {
        const prefixedName = rename(name)
        cache[prefixedName] = cache[prefixedName] || []
        fn.category = category
        cache[prefixedName].push(fn)
      }
    },

    once(name: T, fn: Callback, category?: F) {
      if (isString(name) && isCallback(fn)) {
        const prefixedName = rename(name)
        cache[prefixedName] = cache[prefixedName] || []
        fn.category = category
        fn.isOnceDone = false
        cache[prefixedName].push(fn)
      }
    },

    off(name: T, fn?: Callback, category?: F) {
      const prefixedName = rename(name)
      if (!fn && !category) {
        delete cache[prefixedName]
      } else if (category) {
        const fns = cache[prefixedName] || []
        const targets = fns.filter((item: Callback) => item.category === category)
        for (let i = 0; i < targets.length; i++) {
          fns.splice(fns.indexOf(targets[i]), 1)
        }
        if (!fns.length) {
          delete cache[prefixedName]
        }
      } else if (fn) {
        const fns = cache[prefixedName] || []
        fns.splice(fns.indexOf(fn), 1)
        if (!fns.length) {
          delete cache[prefixedName]
        }
      }
    },

    fire(name: T, args?: unknown, context?: unknown) {
      const fns = cache[rename(name)]
      if (fns) {
        let fn
        for (let i = 0, l = fns.length; i < l; i++) {
          fn = fns[i]
          if (isNil(fn.isOnceDone)) {
            fn.apply(context || null, group(args))
          } else if (fn.isOnceDone === false) {
            fn.apply(context || null, group(args))
            fn.isOnceDone = true
          }
        }
      }
    },

    has(name: T) {
      return !!cache[rename(name)]
    },
  }
}
