import * as d3 from 'd3-random'
import {characters} from './constants'
import {
  RawTable,
  RandomOptions,
  RawTableList,
  NormalRandomOptions,
  PoissonRandomOptions,
} from '../types'

const mapping = {
  normal: ({mu, sigma}: Pick<NormalRandomOptions, 'mu' | 'sigma'>) => d3.randomNormal(mu, sigma),
  poisson: ({lambda = 1}: Pick<PoissonRandomOptions, 'lambda'>) => d3.randomPoisson(lambda),
}

const toFixed = (number: number, decimal: number) => {
  return Math.round(number / 10 ** -decimal) / 10 ** decimal
}

export const randomTableList = (options: RandomOptions): RawTableList => {
  const {mode, row, column, decimalPlace = 0} = options
  const getNumber = mapping[mode](options)
  const numbers = new Array(row * column).fill(null).map(() => toFixed(getNumber(), decimalPlace))
  const headers = ['dimension'].concat(new Array(column).fill(null).map((_, i) => `Class ${i + 1}`))
  const lists = new Array(row)
    .fill(null)
    .map((_, i) => [`Item ${i + 1}`, ...numbers.slice(i * column, (i + 1) * column)])
  return [headers, ...lists]
}

export const randomTable = (options: RandomOptions): RawTable => {
  const {mode, row, column, decimalPlace = 8} = options
  const getNumber = mapping[mode](options)
  const numbers = new Array(row)
    .fill(null)
    .map(() => new Array(column).fill(null).map(() => toFixed(getNumber(), decimalPlace)))
  const rows = new Array(row).fill(null).map((_, i) => `Row ${i + 1}`)
  const columns = new Array(column).fill(null).map((_, i) => `Column ${i + 1}`)
  return [rows, columns, numbers]
}

// create a random string
export function uuid(n = 16) {
  let string = ''
  for (let i = 0; i < n; i++) {
    string += characters.charAt(Math.floor(Math.random() * characters.length))
  }
  return string
}
