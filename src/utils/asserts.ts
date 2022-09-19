import {select} from 'd3'
import {fabric} from 'fabric'
import {isArray, isNumber} from 'lodash'
import {LayerAxis, LayerBasemap, LayerBrush, LayerLegend} from '../layers'
import {
  D3Selection,
  LayerInstance,
  RawRelation,
  RawTable,
  RawTableList,
  ScaleBand,
  ScaleLinear,
} from '../types'

export function isRealNumber(value: any): value is number {
  return isNumber(value) && !isNaN(value)
}

export function isApproximateNumber(n1: number, n2: number) {
  return Math.abs(n1 - n2) <= 10 ** -8
}

export function isSvgCntr(selector: any): selector is D3Selection {
  return selector?.constructor.name === select(null).constructor.name
}

export function isCanvasCntr(selector: any): selector is fabric.Group {
  return selector?.constructor.name === fabric.Group.name && selector?.getObjects
}

export function isLayerAxis(instance: Maybe<LayerInstance>): instance is LayerAxis {
  return instance instanceof LayerAxis
}

export function isLayerBrush(instance: Maybe<LayerInstance>): instance is LayerBrush {
  return instance instanceof LayerBrush
}

export function isLayerLegend(instance: Maybe<LayerInstance>): instance is LayerLegend {
  return instance instanceof LayerLegend
}

export function isLayerBasemap(instance: Maybe<LayerInstance>) {
  return instance instanceof LayerBasemap
}

export function isScaleBand(scale: any): scale is ScaleBand {
  return typeof scale?.bandwidth === 'function'
}

export function isScaleLinear(scale: any): scale is ScaleLinear {
  return typeof scale?.ticks === 'function'
}

export function isRawTableList(tableList: any): tableList is RawTableList {
  return (
    isArray(tableList) &&
    tableList.length !== 0 &&
    tableList.findIndex((item) => !isArray(item)) === -1 &&
    new Set(tableList.map((item) => item.length)).size === 1
  )
}

export function isRawTable(table: any): table is RawTable {
  return (
    isArray(table) &&
    table.length === 3 &&
    table.findIndex((item) => !isArray(item)) === -1 &&
    isRawTableList(table[2]) &&
    table[2].length === table[0].length &&
    table[2][0].length === table[1].length
  )
}

export function isRawRelation(relation: any): relation is RawRelation {
  return (
    isArray(relation) &&
    relation.length === 2 &&
    isRawTableList(relation[0]) &&
    isRawTableList(relation[1])
  )
}
