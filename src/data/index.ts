import {DataBase, Relation, Table, TableList} from '.'

export * from './base'
export * from './custom'
export * from './relation'
export * from './scale'
export * from './table-list'
export * from './table'

export const dataMapping = {
  base: DataBase,
  table: Table,
  tableList: TableList,
  relation: Relation,
}
