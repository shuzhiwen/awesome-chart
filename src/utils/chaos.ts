import {range} from 'd3'
import {isArray, isNil, isNumber} from 'lodash'
import {Box} from '../types'

const ctx = document.createElement('canvas').getContext('2d')!

/**
 * The method won't do anything.
 * @returns
 * Return input itself.
 */
export function noChange<T = unknown>(input: T) {
  return input
}

/**
 * If input is not an array, change it to an array.
 * @returns
 * Return `[]` if input is null or undefined.
 * @returns
 * Return an array if input is valid value.
 */
export function group<T>(input: MaybeGroup<T>) {
  return isNil(input) ? [] : isArray(input) ? input : [input]
}

/**
 * Find the first value recursively that is not an array.
 * @example
 * ungroup([[[1], 2], 3]) // 1
 * ungroup([null, [1]]) // null
 */
export function ungroup<T>(input: T): Ungroup<T> {
  return !isArray(input) ? input : ungroup(input[0])
}

/**
 * Convert percentage string to number.
 * @param input
 * The percentage string or number to transform.
 * @param relative
 * The meta number of percentage input.
 */
export function getPercentageNumber(input: Meta, relative: number) {
  if (typeof input === 'string') {
    if (input.includes('%')) {
      return (Number(input.trim().replaceAll('%', '')) / 100) * relative
    }
    return Number(input)
  }
  return input
}

export function getTextWidth(
  text: Meta,
  fontSize: Meta = 12,
  fontFamily = 'PingFang SC, Helvetica, sans-serif'
) {
  ctx.font = `${isNumber(fontSize) ? `${fontSize}px` : fontSize} ${fontFamily}`
  return ctx.measureText(String(text)).width
}

/**
 * Judge magnitude of number.
 * @param number
 * The value to be estimated.
 * @example
 * getMagnitude(300) // 100
 * getMagnitude(50) // 10
 */
export function getMagnitude(number: number) {
  return 10 ** Math.floor(Math.log10(Math.abs(number)))
}

/**
 * Download string as a file.
 * @param data
 * The string about to download.
 * @param fileName
 * The name with suffix.
 */
export function download(data: string, fileName: string) {
  const dataUrl = URL.createObjectURL(new Blob([data]))
  const a = document.createElement('a')
  a.download = fileName
  a.href = data.match('base64') ? data : dataUrl
  a.click()
}

/**
 * Generates a numeric sequence starting from the given start and stop values.
 * @param step
 * The step defaults to 1.
 * @param toFixed
 * The parameter of Number.toFixed which defaults to 8.
 * @returns
 */
export function robustRange(start: number, end: number, step = 1, toFixed = 8) {
  return range(start, end + (step > 0 ? 1 : -1) * 10 ** -(toFixed + 2), step).map((v) =>
    Number(Number(v).toFixed(toFixed))
  )
}

/**
 * Swap two values or a property of two objects.
 * @param a
 * Object or array or variable.
 * @param b
 * Object or array or variable.
 * @example
 * swap([1, 2], [3, 4], 0, 1) // [4, 2] and [3, 1]
 * swap({a: 1}, {a: 2}, 'a') // {a: 2} and {a: 1}
 */
export function swap(a: any, b: any, key1: Meta, key2: Meta = key1) {
  if (
    (isArray(a) && isArray(b) && isNumber(key1) && isNumber(key2)) ||
    (typeof a === 'object' && typeof b === 'object')
  ) {
    ;[a[key1], b[key2]] = [b[key2], a[key1]]
  } else {
    ;[a, b] = [b, a]
  }
}

/**
 * Syntax sugar for try and catch.
 * @param fn
 * The function that may throw error.
 * @param onError
 * The error handler.
 */
export function errorCatcher<Fn extends AnyFunction>(fn: Fn, onError: (error: Error) => void) {
  return (...args: Parameters<Fn>) => {
    try {
      return fn.call(null, ...args) as ReturnType<Fn>
    } catch (error) {
      onError(error as Error)
    }
  }
}

/**
 * Convert svg shadow string to fabric shadow string.
 * @remark
 * Only the first shadow will be converted.
 * @example
 * svgShadowToFabricShadow('0 0 4px black') // 'black 0 0 4px'
 * svgShadowToFabricShadow('0 0 4px black, 0 0 4px black') // 'black 0 0 4px'
 */
export function svgShadowToFabricShadow(shadows: string) {
  return shadows.split(',').map((shadow) => {
    const shadowAttrs = shadow.split(' ')
    shadowAttrs.unshift(shadowAttrs.pop()!)
    return shadowAttrs.reduce((prev, cur) => `${prev} ${cur}`)
  })[0]
}

/**
 * Rectangle Collision Detection.
 * @returns
 * Return collision or not.
 */
export function isBoxCollision(box1: Box, box2: Box) {
  const {x: x1, y: y1, width: width1, height: height1} = box1
  const {x: x2, y: y2, width: width2, height: height2} = box2

  return !(
    Math.abs(x1 - x2 + (x1 + width1) - (x2 + width2)) >= width1 + width2 ||
    Math.abs(y1 - y2 + (y1 + height1) - (y2 + height2)) >= height1 + height2
  )
}

/**
 * A wrapper around the while syntax, limiting the maximum number of loops.
 */
export function safeLoop(
  condition: AnyFunction<boolean>,
  body: () => false | unknown,
  maxTimes = 10000
) {
  let times = 0
  while (condition()) {
    if (body() === false) break
    if (++times > maxTimes) {
      throw new Error('The number of cycles exceeds the upper limit')
    }
  }
  return times
}
