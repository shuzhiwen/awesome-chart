import {RawRelation, RawTable, RawTableList} from '../types'
import {isRawTableList} from './asserts'

/**
 * Transform tableList to objects.
 * @example
 * tableListToObjects([
 *   ['dimension', 'category'],
 *   ['d1', 1]
 * ])
 * // [{d1: 1}]
 * @throw
 * Throw `Error` when input is not a `RawTableList`.
 */
export function tableListToObjects<K extends Meta, V = Meta>(tableList: RawTableList) {
  if (!isRawTableList(tableList)) {
    throw new Error('invalid input')
  }

  return tableList.slice(1).map((item) => {
    const entries = tableList[0].map((key, i) => [key, item[i]])
    return Object.fromEntries(entries) as unknown as Record<K, V>
  })
}

/**
 * Transform tableList to table.
 * @example
 * tableListToTable([
 *   ['row', 'column', 'value'],
 *   ['r1', 'c1', 1]
 * ])
 * // [['r1'], ['c1'], [[1]]]
 * @throw
 * Throw `Error` when input is not a `RawTableList`.
 */
export function tableListToTable(tableList: RawTableList): RawTable {
  if (!isRawTableList(tableList) || tableList[0].length !== 3) {
    throw new Error('invalid input')
  }

  const rows = Array.from(new Set(tableList.slice(1).map((item) => item[0])))
  const columns = Array.from(new Set(tableList.slice(1).map((item) => item[1])))
  const map = new Map(tableList.map(([row, column, value]) => [`${row}-${column}`, value]))

  return [
    rows,
    columns,
    rows.map((row) => columns.map((column) => map.get(`${row}-${column}`) ?? NaN)),
  ]
}

/**
 * Transform relation to table.
 * @example
 * relationToTable([
 *   ['id', 'name'], [1, 'n1']],
 *   [['from', 'to', 'value'], [1, 1, 1]
 * ])
 * // [[1], [1], [[1]]]
 * @throw
 * Throw `Error` when input is not an array of `RawTableList`.
 */
export function relationToTable([nodeTableList, linkTableList]: RawRelation): RawTable {
  if (!isRawTableList(nodeTableList) || !isRawTableList(linkTableList)) {
    throw new Error('invalid input')
  }

  const idIndex = nodeTableList[0].indexOf('id')
  const nameIndex = nodeTableList[0].indexOf('name')
  const fromIndex = linkTableList[0].indexOf('from')
  const toIndex = linkTableList[0].indexOf('to')
  const valueIndex = linkTableList[0].indexOf('value')
  const nodeIds = Array.from(new Set(nodeTableList.slice(1).map((item) => item[idIndex])))
  const nodeNames = nodeIds.map(
    (id) => nodeTableList.find((item) => item[idIndex] === id)?.[nameIndex] || ''
  )
  const map = new Map(
    linkTableList.map((link) => [`${link[fromIndex]}-${link[toIndex]}`, link[valueIndex]])
  )

  return [
    nodeNames,
    nodeNames,
    nodeIds.map((row) => nodeIds.map((column) => map.get(`${row}-${column}`) ?? NaN)),
  ]
}

/**
 * Matrix transpose operation.
 * @return
 * Return transposed `RawTableList`.
 */
export function transpose(tableList: RawTableList): RawTableList {
  if (!isRawTableList(tableList)) {
    throw new Error('invalid input')
  }

  return tableList[0].map((_, i) => tableList.map((item) => item[i]))
}
