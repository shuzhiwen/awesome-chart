import {isArray, isNumber} from 'lodash'
import {LayerAxis, LayerLegend} from '../layers'
import {
  D3Selection,
  FabricCanvas,
  Layer,
  RawRelation,
  RawTable,
  RawTableList,
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

export function isLayerAxis(instance: Maybe<Layer>): instance is LayerAxis {
  return instance instanceof LayerAxis
}

export function isLayerLegend(instance: Maybe<Layer>): instance is LayerLegend {
  return instance instanceof LayerLegend
}

export function isLayerBaseMap(instance: Maybe<Layer>) {
  return instance?.constructor.name === 'BaseMap'
}

export function isScaleBand(scale: any): scale is ScaleBand {
  return typeof scale?.bandwidth === 'function'
}

export function isScaleLinear(scale: any): scale is ScaleLinear {
  return typeof scale?.ticks === 'function'
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
