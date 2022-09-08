import * as Data from '.'
export * from './base'
export * from './relation'
export * from './table-list'
export * from './table'

export default Data
export const dataMapping = {
  base: Data.DataBase,
  table: Data.DataTable,
  tableList: Data.DataTableList,
  relation: Data.DataRelation,
}
