import {isNil, isFunction, isString} from 'lodash'
import {uuid} from '.'

type Callback = Function & {
  category?: string
  isOnceDone?: boolean
}

const isCallback = (fn: unknown): fn is Callback => isFunction(fn)

export const createEvent = (key: string) => {
  const id = `__event-${key}-${uuid()}`
  const rename = (name: string) => `${id}-${name}`
  const cache: Record<string, Callback[]> = {}

  return {
    onWithOff(name: string, fn: Callback, category: string = name) {
      this.off(name, fn, category)
      this.on(name, fn, category)
    },

    on(name: string, fn: Callback, category: string = name) {
      if (isString(name) && isCallback(fn)) {
        const prefixedName = rename(name)
        cache[prefixedName] = cache[prefixedName] || []
        fn.category = category
        cache[prefixedName].push(fn)
      }
    },

    once(name: string, fn: Callback, category: string = name) {
      if (isString(name) && isCallback(fn)) {
        const prefixedName = rename(name)
        cache[prefixedName] = cache[prefixedName] || []
        fn.category = category
        fn.isOnceDone = false
        cache[prefixedName].push(fn)
      }
    },

    off(name: string, fn?: Callback, category?: string) {
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

    fire(name: string, args?: unknown, context?: unknown) {
      const fns = cache[rename(name)]
      if (fns) {
        let fn
        for (let i = 0, l = fns.length; i < l; i++) {
          fn = fns[i]
          if (isNil(fn.isOnceDone)) {
            fn.apply(context || null, args)
          } else if (fn.isOnceDone === false) {
            fn.apply(context || null, args)
            fn.isOnceDone = true
          }
        }
      }
    },

    has(name: string) {
      return !!cache[rename(name)]
    },
  }
}
