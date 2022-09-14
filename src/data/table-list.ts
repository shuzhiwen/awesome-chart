import {cloneDeep, sum, min, max} from 'lodash'
import {group, isRawTableList, transpose} from '../utils'
import {DataBase} from './base'
import {DataBaseOptions, RawTableList, TableListDataShape, TableListOptions} from '../types'

export class DataTableList extends DataBase<RawTableList> {
  private _data: TableListDataShape = []

  get headers() {
    return this._data.map(({header}) => header)
  }

  get lists() {
    return this._data.map(({list}) => list)
  }

  get rawTableList() {
    return transpose(this.lists)
  }

  constructor(data: RawTableList, options?: DataBaseOptions) {
    super(data, options)
    this.update(data)
  }

  filterRows(rows: number[]) {
    const data = this._data.map(({list, ...rest}) => ({
      list: list.filter((_, index) => rows.includes(index)),
      ...rest,
    }))

    const result = new DataTableList([[]], this.options)
    result._data = data
    return result
  }

  select(headers: MaybeGroup<Meta>, options?: TableListOptions): DataTableList {
    const {mode = 'copy', target = 'row'} = options || {}
    let data = cloneDeep(this._data.filter(({header}) => group(headers).includes(header)))

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

    const result = new DataTableList([[]], this.options)
    result._data = data
    return result
  }

  update(tableList: RawTableList, options: AnyObject = {}) {
    if (!isRawTableList(tableList)) {
      this.log.error('Illegal data', tableList)
      return
    }

    const updateData = tableList[0].map((header, index) => ({
      ...options[header],
      list: tableList.slice(1).map((row) => row[index]),
      header,
    }))

    updateData.forEach((item) => {
      const index = this.headers.findIndex((header) => item.header === header)
      if (index !== -1) {
        this._data[index] = item
      } else {
        this._data.push(item)
      }
    })
  }

  push(...rows: Meta[][]) {
    rows.forEach((row) => {
      if (row.length !== this._data.length) {
        this.log.error('Illegal data', row)
      } else {
        row.forEach((value, i) => this.lists[i].push(value))
      }
    })
  }

  remove(headers: MaybeGroup<string>) {
    const removedList: TableListDataShape[] = []

    group(headers).forEach((header) => {
      const index = this.headers.findIndex((_header) => _header === header)
      if (index !== -1) {
        removedList.concat(this._data.splice(index, 1))
      }
    })

    return removedList
  }

  concat(...tableLists: DataTableList[]) {
    const newTableList = cloneDeep(this)

    tableLists.forEach((tableList) => {
      cloneDeep(tableList)._data.forEach((item) => {
        const index = newTableList.headers.findIndex((header) => item.header === header)
        if (index !== -1) {
          newTableList._data[index] = item
        } else {
          newTableList._data.push(item)
        }
      })
    })

    return newTableList
  }

  range(): [number, number] {
    return [
      Number(min(this._data.map(({list, min: value}) => min([value, min(list)])))),
      Number(max(this._data.map(({list, max: value}) => max([value, max(list)])))),
    ]
  }

  sort(options: {mode: 'asc' | 'desc'; targets: 'dimension' | 'groupWeight'; variant?: 'date'}) {
    const {rawTableList, headers} = this,
      {mode, targets, variant} = options,
      getValue = (value: Meta) => (variant === 'date' ? new Date(value).getTime() : value)

    if (targets === 'groupWeight') {
      if (mode === 'asc') {
        rawTableList.sort((a, b) => sum(a.slice(1)) - sum(b.slice(1)))
      } else if (mode === 'desc') {
        rawTableList.sort((a, b) => sum(b.slice(1)) - sum(a.slice(1)))
      }
    } else if (targets === 'dimension') {
      if (mode === 'asc') {
        rawTableList.sort((a, b) => (getValue(a[0]) > getValue(b[0]) ? 1 : -1))
      } else if (mode === 'desc') {
        rawTableList.sort((a, b) => (getValue(b[0]) > getValue(a[0]) ? 1 : -1))
      }
    }

    this._data = []
    this.update([headers].concat(rawTableList))
  }
}
