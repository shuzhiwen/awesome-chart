import {DataBase, DataRelation, DataTable, DataTableList} from '.'

export * from './base'
export * from './relation'
export * from './scales'
export * from './table-list'
export * from './table'

export const dataMapping = {
  base: DataBase,
  table: DataTable,
  tableList: DataTableList,
  relation: DataRelation,
}
