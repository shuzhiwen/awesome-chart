import {range} from 'd3'
import {randomNormal, randomPoisson} from 'd3-random'
import {RawTable, RandomOptions, RawTableList} from '../types'

const mapping = {
  normal: ({mu, sigma}: RandomOptions) => randomNormal(mu, sigma),
  poisson: ({lambda = 1}: RandomOptions) => randomPoisson(lambda),
}

const toFixed = (number: number, decimals: number) => {
  return Math.round(number / 10 ** -decimals) / 10 ** decimals
}

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

export const randomTable = (options: RandomOptions): RawTable => {
  const {mode, row, column, decimals = 0} = options
  const getNumber = mapping[mode](options)
  const numbers = range(row).map(() => range(column).map(() => toFixed(getNumber(), decimals)))
  const rows = range(row).map((_, i) => `Row ${i + 1}`)
  const columns = range(column).map((_, i) => `Column ${i + 1}`)
  return [rows, columns, numbers]
}

export function uuid(n = 16) {
  const CHARACTERS = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz0123456789'
  let string = ''

  for (let i = 0; i < n; i++) {
    string += CHARACTERS.charAt(Math.floor(Math.random() * CHARACTERS.length))
  }
  return string
}
