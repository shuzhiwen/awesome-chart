import * as Data from '.'
import {DataBaseOptions} from '../types'
import {createClassRegister} from '../utils'

export * from './base'
export * from './relation'
export * from './table'
export * from './table-list'

export type DataDict = {
  base: Data.DataBase<DataBaseOptions>
  table: Data.DataTable
  tableList: Data.DataTableList
  relation: Data.DataRelation
}

export const DataDict = {
  base: Data.DataBase,
  table: Data.DataTable,
  tableList: Data.DataTableList,
  relation: Data.DataRelation,
}

export const registerCustomData = createClassRegister?.<
  string,
  Data.DataBase<AnyObject>,
  [any, DataBaseOptions]
>(DataDict)
