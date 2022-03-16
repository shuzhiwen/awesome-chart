import * as data from '.'
export * from './base'
export * from './relation'
export * from './table-list'
export * from './table'

export const dataMapping = {
  base: data.DataBase,
  table: data.DataTable,
  tableList: data.DataTableList,
  relation: data.DataRelation,
}
