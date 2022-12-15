import {select} from 'd3'
import {fabric} from 'fabric'
import {isArray, isNil, isNumber} from 'lodash'
import {LayerAxis, LayerBasemap, LayerBrush, LayerLegend} from '../layers'
import {
  D3Selection,
  LayerInstance,
  RawRelation,
  RawTable,
  RawTableList,
  ScaleAngle,
  ScaleBand,
  ScaleLinear,
} from '../types'

/**
 * Check if a number can be calculated.
 * @example
 * isRealNumber(1) // true
 * isRealNumber(NaN) // false
 * @returns
 * Is the value a number other than `NaN`.
 */
export function isRealNumber(value: unknown): value is number {
  return isNumber(value) && !isNaN(value)
}

/**
 * `IsEqual` method that ignore floating-point arithmetic errors.
 * @remark
 * The minimum precision is `1E-8`.
 * @example
 * isApproximateNumber(1.00000001, 1.00000002) // false
 * isApproximateNumber(1.000000001, 1.000000002) // true
 * @returns
 * If two numbers are equal.
 */
export function isApproximateNumber(n1: number, n2: number) {
  return Math.abs(n1 - n2) <= 10 ** -8
}

/**
 * Check if input is svg container.
 * @returns
 * Is the value a d3 selection.
 */
export function isSC(selector: any): selector is D3Selection {
  return selector?.constructor.name === select(null).constructor.name
}

/**
 * Check if input is canvas container.
 * @returns
 * Is the value a fabric group.
 */
export function isCC(selector: any): selector is fabric.Group {
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

export function isScaleAngle(scale: any): scale is ScaleAngle {
  return !isNil(scale?.range?.()?.[0]?.weight)
}

/**
 * Check if input matches a specific data structure.
 * @remark
 * Empty array `[]` will return `false`.
 * @returns
 * Is the input a strictly `RawTableList`.
 */
export function isRawTableList(tableList: unknown): tableList is RawTableList {
  return (
    isArray(tableList) &&
    tableList.length !== 0 &&
    tableList.findIndex((item) => !isArray(item)) === -1 &&
    new Set(tableList.map((item) => item.length)).size === 1
  )
}

/**
 * Check if input matches a specific data structure.
 * @returns
 * Is the input a strictly `RawTable`.
 */
export function isRawTable(table: unknown): table is RawTable {
  return (
    isArray(table) &&
    table.length === 3 &&
    table.findIndex((item) => !isArray(item)) === -1 &&
    isRawTableList(table[2]) &&
    table[2].length === table[0].length &&
    table[2][0].length === table[1].length
  )
}

/**
 * Check if input matches a specific data structure.
 * @returns
 * Is the input a strictly `RawRelation`.
 */
export function isRawRelation(relation: unknown): relation is RawRelation {
  return (
    isArray(relation) &&
    relation.length === 2 &&
    isRawTableList(relation[0]) &&
    isRawTableList(relation[1]) &&
    ['id', 'name'].every((key) => relation[0][0].includes(key)) &&
    ['from', 'to'].every((key) => relation[1][0].includes(key))
  )
}
