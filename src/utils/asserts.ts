import {isArray} from 'lodash'
import {D3Selection, FabricCanvas, RawRelation, RawTable, RawTableList} from '../types'

export function isSvgContainer(selector: any): selector is D3Selection {
  return selector?.constructor.name === 'Selection'
}

export function isCanvasContainer(selector: any): selector is FabricCanvas {
  return selector?.constructor.name === 'klass'
}

export function isTableList(tableList: any): tableList is RawTableList {
  if (
    !isArray(tableList) ||
    tableList.length === 0 ||
    tableList.findIndex((item) => !isArray(item)) !== -1 ||
    new Set(tableList.map((item) => item.length)).size !== 1
  ) {
    return false
  }
  return true
}

export function isTable(table: any): table is RawTable {
  if (
    !isArray(table) ||
    table.length !== 3 ||
    table.findIndex((item) => !isArray(item)) !== -1 ||
    !isTableList(table[2]) ||
    table[2].length !== table[0].length ||
    table[2][0].length !== table[1].length
  ) {
    return false
  }
  return true
}

export function isRelation(relation: any): relation is RawRelation {
  const [nodeTableList, linkTableList] = relation
  if (!isTableList(nodeTableList) || !isTableList(linkTableList)) {
    return false
  }
  return true
}
