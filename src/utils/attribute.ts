import chroma from 'chroma-js'
import {isArray, isNil} from 'lodash'
import {D3Selection} from '../types'

/**
 * Batch add styles for d3 selection.
 * @param style
 * The object that represent element styles.
 * @param index
 * The group index for each attributes.
 */
export function addStyle(target: D3Selection, style: AnyObject = {}, index = 0) {
  Object.entries(style).forEach(([key, value]) => target.style(key, getAttr(value, index, '')))
  return target
}

/**
 * Batch add events for d3 selection.
 * @param event
 * The object that represent element events.
 * @param data
 * Parameters of each event.
 */
export function addEvent(target: D3Selection, event: AnyEventObject = {}, data?: unknown) {
  Object.entries(event).forEach(([key, handler]) => target.on(key, handler.bind(null, data)))
  target.style('cursor', 'pointer')
  return target
}

/**
 * Inject alpha channel for color.
 * @example
 * mergeAlpha('rgba(0,0,0,0.8)', 0.5) // rgba(0,0,0,0.4)
 * mergeAlpha('rgba(0,0,0,0)', 1) // rgba(0,0,0,0)
 * @returns
 * Return merged color.
 */
export function mergeAlpha<T>(color: T, opacity: number) {
  try {
    if (typeof color !== 'string' && typeof color !== 'number') {
      throw new Error('Invalid Color')
    }
    return chroma(color)
      .alpha(chroma(color).alpha() * opacity)
      .hex()
  } catch (error) {
    return color
  }
}

/**
 * Attribute fetching method for drawing methods.
 * @param index
 * The group index for one attribute.
 * @param defaultValue
 * Return defaultValue when get attribute failed.
 * @returns
 * Return attribute value.
 */
export function getAttr<T>(target: MaybeGroup<T>, index = 0, defaultValue: T): T {
  if (isArray(target)) {
    if (target.length > index && !isNil(target[index])) {
      return target[index] ?? defaultValue
    }
    return defaultValue
  }
  return isNil(target) ? defaultValue : target
}

/**
 * Small camel case style key to css style key.
 * @param object
 * The object that represent element styles.
 * @example
 * transformAttr({fontSize: 12}) // {'font-size': 12}
 * @returns
 * Return transformed style object.
 */
export function transformAttr(object: AnyObject) {
  return Object.fromEntries(
    Object.entries(object).map(([key, value]) => {
      const index = key.search(/[A-Z]/)
      if (index !== -1) {
        key = key.toLowerCase()
        key = `${key.slice(0, index)}-${key.slice(index)}`
      }
      return [key, value]
    })
  )
}
