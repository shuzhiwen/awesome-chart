import chroma from 'chroma-js'
import {isArray, isNil} from 'lodash'
import {D3Selection} from '../types'

export function addStyle(target: D3Selection, style: AnyObject = {}, index = 0) {
  Object.entries(style).forEach(([key, value]) => target.style(key, getAttr(value, index, '')))
  return target
}

export function addEvent(target: D3Selection, event: AnyEventObject = {}, data?: any) {
  Object.entries(event).forEach(([key, handler]) => target.on(key, handler.bind(null, data)))
  target.style('cursor', 'pointer')
  return target
}

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

export function getAttr<T>(target: MaybeGroup<T>, index = 0, defaultValue: T): T {
  if (isArray(target)) {
    if (target.length > index && !isNil(target[index])) {
      return target[index] ?? defaultValue
    }
    return defaultValue
  }
  return isNil(target) ? defaultValue : target
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
