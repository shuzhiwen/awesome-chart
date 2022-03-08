import * as d3 from 'd3'
import chroma from 'chroma-js'
import {isArray, isNil} from 'lodash'
import {D3Selection} from '../types'

const ctx = document.createElement('canvas').getContext('2d')!
const fontFamily = "'PingFang SC', 'Helvetica Neue', Helvetica, Tahoma, Helvetica, sans-serif"

export function noChange(input: any) {
  return input
}

export function getTextWidth(text: string, fontSize: number | string = 12) {
  ctx.font = `${typeof fontSize === 'string' ? fontSize : `${fontSize}px`} ${fontFamily}`
  return ctx.measureText(text).width
}

// save the string as a file
export function download(data: string, fileName: string) {
  const dataUrl = `data:,${data}`
  const a = document.createElement('a')
  a.download = fileName
  a.href = dataUrl
  a.click()
}

// the output range contains stop
export function range(start: number, end: number, step = 1, toFixed = 8) {
  return d3
    .range(start, end + (step > 0 ? 1 : -1) * 10 ** -(toFixed + 2), step)
    .map((v) => Number(Number(v).toFixed(toFixed)))
}

// combining color and opacity and check for errors
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

// add style for d3 selection
export function addStyle(target: D3Selection, style: AnyObject, index: number = 0) {
  Object.entries(style).forEach(([key, value]) => target.style(key, getAttr(value, index, '')))
}

// add event for d3 selection
export function addEvent(target: D3Selection, event: AnyEventObject, data?: any) {
  Object.entries(event).forEach(([key, handler]) => target.on(key, handler.bind(null, data)))
  target.style('cursor', 'pointer')
}

// get real attr from target
export function getAttr<T>(target: MaybeGroup<T>, index: number = 0, defaultValue: T): T {
  if (isArray(target)) {
    if (target.length > index && !isNil(target[index])) {
      return target[index]
    }
    return defaultValue
  }
  return target ?? defaultValue
}

// format: fontSize => font-size
export function transformAttr(object: AnyObject) {
  const result: AnyObject = {}
  Object.entries(object).forEach(([key, value]) => {
    const index = key.search(/[A-Z]/)
    if (index !== -1) {
      key = key.toLowerCase()
      key = `${key.slice(0, index)}-${key.slice(index)}`
    }
    result[key] = value
  })
  return result
}
