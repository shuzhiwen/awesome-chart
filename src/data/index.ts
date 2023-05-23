import * as Data from '.'
import {DataBaseOptions} from '../types'
import {createClassRegister} from '../utils'

export default Data
export * from './base'
export * from './relation'
export * from './table-list'
export * from './table'

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
