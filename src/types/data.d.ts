import {DataBase, dataMapping, DataRelation, DataTable, DataTableList} from '../data'

export type DataType = keyof typeof dataMapping

export type DataShape = DataBase<any> | DataTableList | DataTable | DataRelation

export type RawTableList = Meta[][]

export type RawTable = [Meta[], Meta[], RawTableList]

export type RawRelation = [RawTableList, RawTableList]

export type TableDataShape = RawTable

export type TableListDataShape = {
  header: string
  list: Meta[]
  min?: Meta
  max?: Meta
}[]

export interface Edge {
  id: Meta
  from: Meta
  to: Meta
  value?: Meta
}

export interface Node {
  id: Meta
  name: Meta
  value?: Meta
  level?: Meta
  parents?: Meta[]
  children?: Meta[]
}

export interface RelationDataShape {
  roots: Meta[]
  nodes: Node[]
  edges: Edge[]
}

export interface TableListOptions {
  mode?: 'sum' | 'percentage' | 'copy'
  target?: 'row' | 'column'
}

export interface TableOptions {
  target?: 'row' | 'column'
}

export interface RelationOptions {}
