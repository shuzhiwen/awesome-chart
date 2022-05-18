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
  const {mode, row, column, decimals = 0} = options
  const getNumber = mapping[mode](options)
  const numbers = new Array(row * column).fill(null).map(() => toFixed(getNumber(), decimals))
  const headers = ['dimension'].concat(new Array(column).fill(null).map((_, i) => `Class ${i + 1}`))
  const lists = new Array(row)
    .fill(null)
    .map((_, i) => [`Item ${i + 1}`, ...numbers.slice(i * column, (i + 1) * column)])
  return [headers, ...lists]
}

export const randomTable = (options: RandomOptions): RawTable => {
  const {mode, row, column, decimals = 8} = options
  const getNumber = mapping[mode](options)
  const numbers = new Array(row)
    .fill(null)
    .map(() => new Array(column).fill(null).map(() => toFixed(getNumber(), decimals)))
  const rows = new Array(row).fill(null).map((_, i) => `Row ${i + 1}`)
  const columns = new Array(column).fill(null).map((_, i) => `Column ${i + 1}`)
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
