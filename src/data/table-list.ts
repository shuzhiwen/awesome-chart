import {cloneDeep, sum, min, max} from 'lodash'
import {createEvent, createLog, isTableList, transpose} from '../utils'
import {DataBase} from './base'
import {
  RawTableList as Input,
  TableListDataShape as Shape,
  TableListOptions as Options,
  Meta,
  RawTableList,
} from '../types'

export class TableList extends DataBase<RawTableList, Options> {
  readonly log = createLog('data:table-list')

  readonly event = createEvent('data:table-list')

  private _data: Shape = []

  get data() {
    return this._data
  }

  constructor(tableList: Input, options: Options = {}) {
    super({source: tableList, options})
    this.update(tableList, options)
  }

  // get subset of the tableList without changing previous data
  select(headers: MaybeGroup<string>, options: Options): TableList {
    const {mode = 'sum', target = 'column'} = options
    const headerArray = Array.isArray(headers) ? headers : [headers]
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
    } else if (mode === 'percentage') {
      if (target === 'row') {
        const transposedTableList = transpose(data.map(({list}) => list))
        const sums = transposedTableList.map((item) => sum(item))
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
    // HACK: create a new tableList
    const result = new TableList([[]], options)
    result._data = data
    return result
  }

  update(tableList: Input, options: AnyObject = {}) {
    if (!isTableList(tableList)) {
      this.log.error('illegal data', tableList)
    } else {
      // new dataset
      const updateData = tableList[0].map((header, index) => ({
        ...options[header],
        list: tableList.slice(1).map((row) => row[index]),
        header,
      }))
      // override
      updateData.forEach((item) => {
        const index = this.data.findIndex(({header}) => item.header === header)
        if (index !== -1) {
          this.data[index] = item
        } else {
          this.data.push(item)
        }
      })
    }
    return this
  }

  // append rows to the list
  push(...rows: Meta[][]) {
    rows.forEach((row) => {
      if (row.length !== this.data.length) {
        this.log.error('illegal data', row)
      } else {
        row.forEach((value, i) => this.data[i].list.push(value))
      }
    })
    return this.data.length
  }

  // remove columns from the list
  remove(headers: MaybeGroup<string>) {
    const removedList: Shape[] = []
    const headerArray = Array.isArray(headers) ? headers : [headers]
    headerArray.forEach((header) => {
      const index = this.data.findIndex((item) => item.header === header)
      if (index !== -1) {
        removedList.concat(this.data.splice(index, 1))
      }
    })
    return removedList
  }

  // concat tableLists without changing previous data
  concat(...tableLists: TableList[]) {
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
    return newTableList
  }

  range() {
    return [
      min(this.data.map(({list, min: value}) => min([value, min(list)]))),
      max(this.data.map(({list, max: value}) => max([value, max(list)]))),
    ]
  }
}
