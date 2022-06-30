import {DataBase, dataMapping, DataRelation, DataTable, DataTableList} from '../data'

export type DataType = keyof typeof dataMapping

export type DataShape = DataBase<any> | DataTableList | DataTable | DataRelation

export type DataBaseOptions = Partial<{
  skip: Meta[]
  order: AnyObject
}>

export type TableListOptions = Partial<{
  target: 'row' | 'column'
  mode: 'sum' | 'percentage' | 'copy'
}>

export type TableOptions = Partial<{
  target: 'row' | 'column'
}>

export type RawTableList = Meta[][]

export type RawTable = [Meta[], Meta[], RawTableList]

export type RawRelation = [RawTableList, RawTableList]

export type TableDataShape = RawTable

export type TableListDataShape = {
  header: Meta
  list: Meta[]
  min?: Meta
  max?: Meta
}[]

export interface Edge {
  id: Meta
  from: Meta
  to: Meta
  value?: number
}

export interface Node {
  id: Meta
  name: Meta
  value?: number
  level?: number
  parents?: Node[]
  children?: Node[]
}

export interface RelationDataShape {
  roots: Meta[]
  nodes: Node[]
  edges: Edge[]
}
