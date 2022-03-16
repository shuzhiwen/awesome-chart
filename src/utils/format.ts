import * as d3 from 'd3-format'
import {FormatNumberConfig, OverflowControlConfig} from '../types'
import {getTextWidth} from './chaos'

export const formatNumber = (data: string | number, config?: FormatNumberConfig) => {
  const number = Number(data)
  const {percentage = false, thousandth = false, decimals = 8} = config || {}

  if (!config) {
    // anonymous formatting
    if (!Number.isNaN(number)) {
      return d3.format(`.${8}~f`)(number)
    }
    return data
  } else {
    return d3.format(`${thousandth ? ',' : ''}.${decimals}~${percentage ? '%' : 'f'}`)(number)
  }
}

export const overflowControl = (data: string | number, config: OverflowControlConfig) => {
  const text = String(data)
  const {omit = true, width = Infinity, height = Infinity, fontSize = 12} = config

  if (fontSize > height) {
    return null
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
