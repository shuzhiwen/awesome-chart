import * as d3 from 'd3'
import chroma from 'chroma-js'
import {isArray, isNil, isNumber} from 'lodash'
import {D3Selection} from '../types'

const ctx = document.createElement('canvas').getContext('2d')!
const fontFamily = "'PingFang SC', 'Helvetica Neue', Helvetica, Tahoma, Helvetica, sans-serif"

export function noChange(input: any) {
  return input
}

export function group<T>(input: MaybeGroup<T>) {
  return isNil(input) ? [] : isArray(input) ? input : [input]
}

export function ungroup<T>(input: MaybeGroup<T>): Maybe<T> {
  return !isArray(input) ? input : input.length ? ungroup(input[0]) : null
}

export function getTextWidth(text: Meta, fontSize: number | string = 12) {
  ctx.font = `${isNumber(fontSize) ? `${fontSize}px` : fontSize} ${fontFamily}`
  return ctx.measureText(String(text)).width
}

export function download(data: string, fileName: string) {
  const dataUrl = `data:,${data}`
  const a = document.createElement('a')
  a.download = fileName
  a.href = dataUrl
  a.click()
}

export function range(start: number, end: number, step = 1, toFixed = 8) {
  return d3
    .range(start, end + (step > 0 ? 1 : -1) * 10 ** -(toFixed + 2), step)
    .map((v) => Number(Number(v).toFixed(toFixed)))
}

export function mergeAlpha<T>(color: T, opacity: number) {
  try {
    if (typeof color !== 'string' && typeof color !== 'number') {
      throw new Error()
    }
    return chroma(color).alpha(opacity).hex()
  } catch (error) {
    return color
  }
}

export function addStyle(target: D3Selection, style: AnyObject, index: number = 0) {
  Object.entries(style).forEach(([key, value]) => target.style(key, getAttr(value, index, '')))
}

export function addEvent(target: D3Selection, event: AnyEventObject, data?: any) {
  Object.entries(event).forEach(([key, handler]) => target.on(key, handler.bind(null, data)))
  target.style('cursor', 'pointer')
}

export function getAttr<T>(target: MaybeGroup<T>, index: number = 0, defaultValue: T): T {
  if (isArray(target)) {
    if (target.length > index && !isNil(target[index])) {
      return target[index] ?? defaultValue
    }
    return defaultValue
  }
  return target ?? defaultValue
}

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

export function safeTransform(transform: string, key: string, value: Meta) {
  if (!transform || transform.search(key) === -1) {
    return `${transform ?? ''}${key}(${value})`
  }
  return transform.replace(new RegExp(`${key}\([\\w\\W]*\)`), `${key}(${value})`)
}
