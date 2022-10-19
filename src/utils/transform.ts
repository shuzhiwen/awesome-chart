import {RawRelation, RawTable, RawTableList} from '../types'
import {isRawTableList} from './asserts'

export function tableListToObjects<K extends Meta, V = Meta>(tableList: RawTableList) {
  if (!isRawTableList(tableList)) {
    throw new Error('invalid input')
  }

  return tableList.slice(1).map((item) => {
    const entries = tableList[0].map((key, i) => [key, item[i]])
    return Object.fromEntries(entries) as unknown as Record<K, V>
  })
}

export function tableListToTable(tableList: RawTableList): Maybe<RawTable> {
  if (!isRawTableList(tableList) || tableList[0].length !== 3) {
    throw new Error('invalid input')
  }

  const rows = Array.from(new Set(tableList.slice(1).map((item) => item[0])))
  const columns = Array.from(new Set(tableList.slice(1).map((item) => item[1])))

  return [
    rows,
    columns,
    rows.map((row) =>
      columns.map((column) => {
        const target = tableList.find((item) => item[0] === row && item[1] === column)
        return target?.[2] || NaN
      })
    ),
  ]
}

export function relationToTable([nodeTableList, linkTableList]: RawRelation): Maybe<RawTable> {
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

  return [
    nodeNames,
    nodeNames,
    nodeIds.map((row) =>
      nodeIds.map((column) => {
        const target = linkTableList.find(
          (item) => item[fromIndex] === row && item[toIndex] === column
        )
        return target ? target[valueIndex] : NaN
      })
    ),
  ]
}

export function transpose(tableList: RawTableList): RawTableList {
  if (!isRawTableList(tableList)) {
    throw new Error('invalid input')
  }

  return tableList[0].map((_, i) => tableList.map((item) => item[i]))
}
