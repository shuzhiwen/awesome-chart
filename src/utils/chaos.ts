import * as d3 from 'd3'
import chroma from 'chroma-js'
import {isArray, isNil, isNumber} from 'lodash'
import {D3Selection} from '../types'

const ctx = document.createElement('canvas').getContext('2d')!
const fontFamily = '"PingFang SC", "Helvetica Neue", Helvetica, Tahoma, Helvetica, sans-serif'

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
  const dataUrl = URL.createObjectURL(new Blob([data]))
  const a = document.createElement('a')
  a.download = fileName
  a.href = data.match('base64') ? data : dataUrl
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

export function addStyle(target: D3Selection, style: AnyObject = {}, index = 0) {
  Object.entries(style).forEach(([key, value]) => target.style(key, getAttr(value, index, '')))
  return target
}

export function addEvent(target: D3Selection, event: AnyEventObject = {}, data?: any) {
  Object.entries(event).forEach(([key, handler]) => target.on(key, handler.bind(null, data)))
  target.style('cursor', 'pointer')
  return target
}

export function getAttr<T>(target: MaybeGroup<T>, index = 0, defaultValue: T): T {
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

function getTransformSuffix(key: string) {
  if (key.match(/rotate/)) {
    return 'deg'
  } else if (key.match(/(translateX|translateY)/)) {
    return 'px'
  }
  return ''
}

export function safeTransform(
  transform: string,
  key: string,
  value: number,
  {unit = false, append = false} = {}
) {
  const target = transform === 'none' || !transform ? '' : transform,
    suffix = unit ? getTransformSuffix(key) : '',
    regExp = new RegExp(`${key}\\(.*?\\)`),
    prevValue = target.match(regExp)?.[0].split(/\(|\)/).at(1)?.replaceAll(suffix, '') ?? '',
    nextValue = value + Number(prevValue)

  if (!target.match(key)) {
    return `${target ?? ''}${key}(${value}${suffix})`
  }

  return target.replace(regExp, `${key}(${append ? nextValue : value}${suffix})`)
}
