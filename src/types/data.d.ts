import {DataBase, dataMapping, DataRelation, DataTable, DataTableList} from '../data'
import {ScaleBand, ScaleLinear, ScaleArc} from '../data'

export type Meta = string | number

export type DataType = keyof typeof dataMapping

export type DataShape = DataBase<unknown> | DataTableList | DataTable | DataRelation

export type RawTableList = Meta[][]

export type TableListOptions = {
  mode?: 'sum' | 'percentage'
  target?: 'row' | 'column'
}

export type TableListDataItemShape = {
  header: string
  list: Meta[]
  min?: Meta
  max?: Meta
}

export type TableListDataShape = TableListDataItemShape[]

export type RawTable = [Meta[], Meta[], RawTableList]

export type TableOptions = {
  target?: 'row' | 'column'
}

export type TableDataShape = RawTable

export type RawRelation = [RawTableList, RawTableList]

export type RelationOptions = {}

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

export type ScaleNiceShape = {
  count?: number
  zero?: boolean
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
  domain: DataTableList
  range: [number, number]
  nice: Pick<ScaleNiceShape, 'paddingInner'>
}

export type Scale =
  | ReturnType<typeof ScaleBand>
  | ReturnType<typeof ScaleLinear>
  | ReturnType<typeof ScaleArc>
