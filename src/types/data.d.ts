import {DataBase, dataMapping, DataRelation, DataTable, DataTableList} from '../data'
import {ColorMatrix} from '../utils'

export type DataType = keyof typeof dataMapping

export type LayerData = DataBase<any> | DataTableList | DataTable | DataRelation

export type DataBaseOptions = Partial<{
  order: AnyObject & {
    type: 'row' | 'column'
    mapping: Record<Meta, number>
    colorMatrix: ColorMatrix
  }
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

export type TableData = RawTable

export type TableListData = {
  header: Meta
  list: Meta[]
  min?: Meta
  max?: Meta
}[]

export type Edge = {
  id: Meta
  from: Meta
  to: Meta
  value?: number
}

export type Node = {
  id: Meta
  name: Meta
  value?: number
  level?: number
  parents?: Node[]
  children?: Node[]
}

export type RelationData = {
  roots: Meta[]
  nodes: Node[]
  edges: Edge[]
}

export type LegendData = {
  filter: 'column' | 'row'
  colorMatrix: ColorMatrix
  legends: {
    label: Meta
    color: string
    shape: LegendShape
  }[]
}

export type TooltipData = Maybe<{
  title?: Meta
  list: Partial<{
    label: Meta
    value: Meta
    color: string
  }>[]
}>
