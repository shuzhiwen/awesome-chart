import {DataBase, dataMapping, DataRelation, DataTable, DataTableList} from '../data'

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
