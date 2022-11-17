import {range, sum} from 'd3'
import {randomNormal, randomPoisson} from 'd3-random'
import {RawTable, RandomOptions, RawTableList} from '../types'

const mapping = {
  normal: ({mu, sigma}: RandomOptions) => randomNormal(mu, sigma),
  poisson: ({lambda = 1}: RandomOptions) => randomPoisson(lambda),
}

const toFixed = (number: number, decimals: number) => {
  return Math.round(number / 10 ** -decimals) / 10 ** decimals
}

/**
 * Create a `RawTableList`.
 * @param options
 * The following parameters are supported
 * - `row`: tableList rows
 * - `column`: tableList columns
 * - `decimals`: exact number of decimal places
 * - `sort`: whether numbers have `asc` order or `desc` order
 * - `mode`: create a number in `normal` way or `poisson` way
 * - `mu`: available when mode is `normal`, defaults to 0
 * - `sigma`: available when mode is `normal`, defaults to 1
 * - `lambda`: available when mode is `poisson`
 */
export const randomTableList = (options: RandomOptions): RawTableList => {
  const {mode, row, column, sort, decimals = 0} = options
  const getNumber = mapping[mode](options)
  const numbers = range(row * column).map(() => toFixed(getNumber(), decimals))
  sort && numbers.sort((a, b) => (sort === 'asc' ? a - b : b - a))
  const headers = ['dimension'].concat(range(column).map((i) => `Class ${i + 1}`))
  const lists = range(row).map((_, i) => [
    `Item ${i + 1}`,
    ...numbers.slice(i * column, (i + 1) * column),
  ])
  return [headers, ...lists]
}

/**
 * Create a `RawTable`.
 * @param options
 * The following parameters are supported
 * - `row`: table rows
 * - `column`: table columns
 * - `decimals`: exact number of decimal places
 * - `sort`: whether numbers have `asc` order or `desc` order
 * - `mode`: create a number in `normal` way or `poisson` way
 * - `mu`: available when mode is `normal`, defaults to 0
 * - `sigma`: available when mode is `normal`, defaults to 1
 * - `lambda`: available when mode is `poisson`
 */
export const randomTable = (options: RandomOptions): RawTable => {
  const {mode, row, column, sort, decimals = 0} = options
  const getNumber = mapping[mode](options)
  const numbers = range(row).map(() => {
    const groupNumbers = range(column).map(() => toFixed(getNumber(), decimals))
    sort && groupNumbers.sort((a, b) => (sort === 'asc' ? a - b : b - a))
    return groupNumbers
  })
  sort && numbers.sort((a, b) => (sort === 'asc' ? sum(a) - sum(b) : sum(b) - sum(a)))
  const rows = range(row).map((_, i) => `Row ${i + 1}`)
  const columns = range(column).map((_, i) => `Column ${i + 1}`)
  return [rows, columns, numbers]
}

/**
 * Generates a unique ID.
 * @param length
 * The length of id, defaults to 16.
 */
export function uuid(length = 16) {
  const CHARACTERS = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz0123456789'
  let string = ''

  for (let i = 0; i < length; i++) {
    string += CHARACTERS.charAt(Math.floor(Math.random() * CHARACTERS.length))
  }
  return string
}
