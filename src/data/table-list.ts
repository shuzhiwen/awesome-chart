import {cloneDeep, sum, min, max} from 'lodash'
import {createLog, isTableList, transpose} from '../utils'
import {DataBase} from './base'
import {
  RawTableList,
  TableListDataShape as Shape,
  TableListOptions as Options,
  Meta,
} from '../types'

export class DataTableList extends DataBase<RawTableList, Options> {
  static readonly log = createLog('data:tableList', DataTableList.name)

  private _data: Shape = []

  get data() {
    return this._data
  }

  constructor(data: RawTableList, options: Options = {}) {
    super(data, options)
    this.update(data, options)
  }

  select(headers: MaybeGroup<string>, options: Options): DataTableList {
    const {mode = 'sum', target = 'column'} = options,
      headerArray = Array.isArray(headers) ? headers : [headers]
    let data = cloneDeep(this.data.filter(({header}) => headerArray.includes(header)))

    if (mode === 'sum') {
      if (target === 'row') {
        const lists = data
          .map(({list}) => list)
          .reduce<Meta[][]>((prev, cur, i) => {
            return i === 0 ? [cur] : [...prev, prev[i - 1].map((value, j) => sum([value, cur[j]]))]
          }, [])
        data = [
          {
            header: data.map(({header}) => header).join('-'),
            list: lists.length > 0 ? lists[lists.length - 1] : [],
            min: min(lists.map((list) => min(list))),
            max: max(lists.map((list) => max(list))),
          },
        ]
      } else if (target === 'column') {
        data = data.map((item) => ({...item, list: [sum(item.list)]}))
      }
    }

    if (mode === 'percentage') {
      if (target === 'row') {
        const transposedTableList = transpose(data.map(({list}) => list)),
          sums = transposedTableList.map((item) => sum(item))
        data = data.map(({list, ...others}) => ({
          ...others,
          list: list.map((value, index) => Number(value) / sums[index]),
        }))
      } else if (target === 'column') {
        data = data.map((item) => {
          const total = sum(item.list)
          return {...item, list: item.list.map((value) => Number(value) / total)}
        })
      }
    }

    const result = new DataTableList([[]], options)
    result._data = data
    return result
  }

  update(tableList: RawTableList, options: AnyObject = {}) {
    if (!isTableList(tableList)) {
      DataTableList.log.error('illegal data', tableList)
      return
    }

    const updateData = tableList[0].map((header, index) => ({
      ...options[header],
      list: tableList.slice(1).map((row) => row[index]),
      header,
    }))

    updateData.forEach((item) => {
      const index = this.data.findIndex(({header}) => item.header === header)
      if (index !== -1) {
        this.data[index] = item
      } else {
        this.data.push(item)
      }
    })
  }

  push(...rows: Meta[][]) {
    rows.forEach((row) => {
      if (row.length !== this.data.length) {
        DataTableList.log.error('illegal data', row)
      } else {
        row.forEach((value, i) => this.data[i].list.push(value))
      }
    })
  }

  remove(headers: MaybeGroup<string>) {
    const removedList: Shape[] = [],
      headerArray = Array.isArray(headers) ? headers : [headers]
    headerArray.forEach((header) => {
      const index = this.data.findIndex((item) => item.header === header)
      if (index !== -1) {
        removedList.concat(this.data.splice(index, 1))
      }
    })
  }

  concat(...tableLists: DataTableList[]) {
    const newTableList = cloneDeep(this)
    tableLists.forEach((tableList) => {
      cloneDeep(tableList)._data.forEach((item) => {
        const index = newTableList._data.findIndex(({header}) => item.header === header)
        if (index !== -1) {
          newTableList._data[index] = item
        } else {
          newTableList._data.push(item)
        }
      })
    })
  }

  range() {
    return [
      min(this.data.map(({list, min: value}) => min([value, min(list)]))),
      max(this.data.map(({list, max: value}) => max([value, max(list)]))),
    ]
  }
}
