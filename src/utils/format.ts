import {format} from 'd3-format'
import {isNil} from 'lodash'
import {FormatNumberConfig, OverflowControlConfig} from '../types'
import {getTextWidth} from './chaos'

/**
 * Format number or string to a specific format string.
 * @remarks
 * Anonymous handle when config is undefined.
 * @param data
 * The origin value to format.
 * @param config
 * The following parameters are supported
 * - `percentage`: is value transform to percentage string
 * - `thousandth`: is value contain quantiles
 * - `decimals`: exact number of decimal places
 * @returns
 * Return formatted string.
 */
export const formatNumber = (data: Maybe<Meta>, config?: FormatNumberConfig) => {
  const number = Number(data ?? '')
  const {percentage = false, thousandth = false, decimals = 8} = config || {}

  if (!config) {
    if (isNil(data) || data === '') {
      return ''
    } else if (!Number.isNaN(number)) {
      return format(`.${8}~f`)(number)
    }
    return data
  }

  return format(`${thousandth ? ',' : ''}.${decimals}~${percentage ? '%' : 'f'}`)(number)
}

/**
 * Limit the display space of strings.
 * @param data
 * The origin value to control.
 * @param config
 * The following parameters are supported
 * - `width`: max string width available
 * - `height`: max string height available
 * - `omit`: when value exceed width, `...` as suffix or not
 * - `fontSize`: string fontSize to calculate real width and height
 * @return
 * Return controlled string
 */
export const overflowControl = (data: Maybe<Meta>, config: OverflowControlConfig) => {
  const text = String(data ?? '')
  const {omit = true, width = Infinity, height = Infinity, fontSize = 12} = config

  if (fontSize > height) {
    return ''
  } else if (width < getTextWidth(text, fontSize)) {
    for (let i = text.length; i > 0; i--) {
      const substring = `${text.substring(0, i)}${omit ? '...' : ''}`
      if (width > getTextWidth(substring, fontSize)) {
        return substring
      }
    }
  }

  return data
}
