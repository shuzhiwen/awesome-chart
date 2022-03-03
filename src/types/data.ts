import {Custom, dataMapping, Relation, Table, TableList} from '../data'
import {ScaleBand, ScaleLinear, ScaleArc} from '../data'

export type Meta = string | number

export type DataType = keyof typeof dataMapping

export type DataShape = Custom | TableList | Table | Relation

// tableList
export type TableListOptions = {
  mode?: 'sum' | 'percentage'
  target?: 'row' | 'column'
}

export type RawTableList = Meta[][]

export type TableListDataShapeItem = {
  header: string
  list: Meta[]
  min?: Meta
  max?: Meta
}

export type TableListDataShape = TableListDataShapeItem[]

// table
export type TableOptions = {
  target?: 'row' | 'column'
}

export type RawTable = [Meta[], Meta[], RawTableList]

export type TableDataShape = RawTable

// relation
export type RelationOptions = {}

export type RawRelation = [RawTableList, RawTableList]

export type Edge = {
  id: Meta
  from: Meta
  to: Meta
  value?: Meta
}

export type Node = {
  id: Meta
  name: Meta
  value?: Meta
  level?: Meta
  parents?: Meta[]
  children?: Meta[]
}

export type RelationDataShape = {
  roots: Meta[]
  nodes: Node[]
  edges: Edge[]
}

// scale
export type ScaleNiceShape = {
  count?: number // tick count
  zero?: boolean // domain extend
  // for band type
  paddingInner?: number
  fixedPaddingInner?: number
  fixedBandwidth?: number
  fixedBoundary?: 'start' | 'end'
}

export interface ScaleBandProps {
  type: 'band'
  domain: string[]
  range: [number, number]
  nice: ScaleNiceShape
}

export interface ScaleLinearProps {
  type: 'linear'
  domain: [number, number]
  range: [number, number]
  nice: Pick<ScaleNiceShape, 'count' | 'zero'>
}

export interface ScaleArcProps {
  type: 'linear'
  domain: TableList
  range: [number, number]
  nice: Pick<ScaleNiceShape, 'paddingInner'>
}

export type Scale =
  | ReturnType<typeof ScaleBand>
  | ReturnType<typeof ScaleLinear>
  | ReturnType<typeof ScaleArc>

// random
export interface BaseRandomOptions {
  row: number
  column: number
  decimalPlace?: number
}

export interface NormalRandomOptions extends BaseRandomOptions {
  mode: 'normal'
  sigma?: number
  mu?: number
}

export interface PoissonRandomOptions extends BaseRandomOptions {
  mode: 'poisson'
  lambda?: number
}

export type RandomOptions = NormalRandomOptions | PoissonRandomOptions
