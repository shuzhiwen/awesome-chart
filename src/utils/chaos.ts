import {range as d3Range} from 'd3'
import {isArray, isNil, isNumber} from 'lodash'

const ctx = document.createElement('canvas').getContext('2d')!
const fontFamily = '"PingFang SC", "Helvetica Neue", Helvetica, Tahoma, Helvetica, sans-serif'

export function noChange<T = unknown>(input: T) {
  return input
}

export function group<T>(input: MaybeGroup<T>) {
  return isNil(input) ? [] : isArray(input) ? input : [input]
}

export function ungroup<T>(input: T): Ungroup<T> {
  return !isArray(input) ? input : ungroup(input[0])
}

export function getTextWidth(text: Meta, fontSize: number | string = 12) {
  ctx.font = `${isNumber(fontSize) ? `${fontSize}px` : fontSize} ${fontFamily}`
  return ctx.measureText(String(text)).width
}

export function getMagnitude(total: number, step: number) {
  return 10 ** Math.floor(Math.log10(Math.abs(total / step)))
}

export function download(data: string, fileName: string) {
  const dataUrl = URL.createObjectURL(new Blob([data]))
  const a = document.createElement('a')
  a.download = fileName
  a.href = data.match('base64') ? data : dataUrl
  a.click()
}

export function range(start: number, end: number, step = 1, toFixed = 8) {
  return d3Range(start, end + (step > 0 ? 1 : -1) * 10 ** -(toFixed + 2), step).map((v) =>
    Number(Number(v).toFixed(toFixed))
  )
}

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

export function errorCatcher<T extends AnyFunction>(fn: T, onError: (error: Error) => void) {
  return (...args: Parameters<T>) => {
    try {
      return fn.call(null, ...args) as ReturnType<T>
    } catch (error) {
      onError(error as Error)
    }
  }
}

export function svgShadowToFabricShadow(shadows: string) {
  return shadows.split(',').map((shadow) => {
    const shadowAttrs = shadow.split(' ')
    shadowAttrs.unshift(shadowAttrs.pop()!)
    return shadowAttrs.reduce((prev, cur) => `${prev} ${cur}`)
  })[0]
}
