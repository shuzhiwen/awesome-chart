import {isArray, isNumber} from 'lodash'
import {layerMapping} from '../layers'
import {
  D3Selection,
  FabricCanvas,
  Layer,
  RawRelation,
  RawTable,
  RawTableList,
  Scale,
  ScaleBand,
  ScaleLinear,
} from '../types'

export function isRealNumber(value: any): value is number {
  return isNumber(value) && !isNaN(value)
}

export function isSvgContainer(selector: any): selector is D3Selection {
  return selector?.constructor.name === 'Selection'
}

export function isCanvasContainer(selector: any): selector is FabricCanvas {
  return selector?.constructor.name === 'klass'
}

export function isLayerAxis(instance: Maybe<Layer>) {
  return instance?.constructor.name === layerMapping.axis.constructor.name
}

export function isLayerBaseMap(instance: Maybe<Layer>) {
  return instance?.constructor.name === layerMapping.baseMap.constructor.name
}

export function isScaleBand(scale: Maybe<Scale>): scale is ScaleBand {
  return scale?.constructor.name === 'ScaleBand'
}

export function isScaleLinear(scale: Maybe<Scale>): scale is ScaleLinear {
  return scale?.constructor.name === 'ScaleLinear'
}

export function isTableList(tableList: any): tableList is RawTableList {
  return (
    isArray(tableList) &&
    tableList.length !== 0 &&
    tableList.findIndex((item) => !isArray(item)) === -1 &&
    new Set(tableList.map((item) => item.length)).size === 1
  )
}

export function isTable(table: any): table is RawTable {
  return (
    isArray(table) &&
    table.length === 3 &&
    table.findIndex((item) => !isArray(item)) === -1 &&
    isTableList(table[2]) &&
    table[2].length === table[0].length &&
    table[2][0].length === table[1].length
  )
}

export function isRelation(relation: any): relation is RawRelation {
  return (
    isArray(relation) &&
    relation.length === 2 &&
    isTableList(relation[0]) &&
    isTableList(relation[1])
  )
}
