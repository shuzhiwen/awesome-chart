import {cloneDeep, max, min, sum} from 'lodash'
import {
  DataBaseOptions,
  RawTableList,
  TableListData,
  TableListOptions,
} from '../types'
import {group, isRawTableList, transpose} from '../utils'
import {DataBase} from './base'

export class DataTableList extends DataBase<RawTableList> {
  private _data: TableListData = []

  /**
   * A header is usually a dimension of a list.
   */
  get headers() {
    return this._data.map(({header}) => header)
  }

  /**
   * A list corresponds to a column in the database table.
   */
  get lists() {
    return this._data.map(({list}) => list)
  }

  /**
   * Pure data without headers.
   */
  get rawTableList() {
    return transpose(this.lists)
  }

  /**
   * The combination of `this.headers` and `this.rawTableList`.
   * Which is equivalent to the original data.
   */
  get rawTableListWithHeaders() {
    return [this.headers].concat(this.rawTableList)
  }

  constructor(data: RawTableList, options?: DataBaseOptions) {
    super(data, options)
    this.update(data)
  }

  /**
   * Filter some rows inside a database table.
   * @param rows
   * An array of row indices.
   * @returns
   * New `DataTableList` containing specific rows.
   */
  selectRows(rows: number[]) {
    const data = this._data.map(({list, header}) => [
      header,
      ...list.filter((_, index) => rows.includes(index)),
    ])

    return new DataTableList(transpose(data), this.options)
  }

  /**
   * Filter some columns in a database table,
   * and perform aggregate operations on demand.
   * @param headers
   * The header of the data list to be selected.
   * @param options
   * Aggregate operation configuration.
   * @returns
   * New `DataTableList` containing specific columns.
   */
  select(headers: MaybeGroup<Meta>, options?: TableListOptions): DataTableList {
    const {mode = 'copy', target = 'row'} = options || {}
    let data = cloneDeep(
      this._data.filter(({header}) => group(headers).includes(header))
    )

    if (mode === 'sum') {
      if (target === 'row') {
        const lists = data
          .map(({list}) => list)
          .reduce<Meta[][]>((prev, cur, i) => {
            return i === 0
              ? [cur]
              : [...prev, prev[i - 1].map((value, j) => sum([value, cur[j]]))]
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
          return {
            ...item,
            list: item.list.map((value) => Number(value) / total),
          }
        })
      }
    }

    const result = new DataTableList(
      transpose(data.map(({list, header}) => [header, ...list])),
      this.options
    )

    return result
  }

  /**
   * Overwrite or append some columns to existing columns.
   * @param tableList
   * The `rawTableList` that need to perform the merge operation.
   * @param options
   * Some extra info on the columns.
   */
  update(tableList: RawTableList, options: AnyObject = {}) {
    if (!isRawTableList(tableList)) {
      throw new Error('Illegal data')
    }

    const updateData = tableList[0].map((header, index) => ({
      ...options[header],
      list: tableList.slice(1).map((row) => row[index]),
      header,
    }))

    updateData.forEach((item) => {
      const index = this.headers.indexOf(item.header)
      if (index !== -1) {
        this._data[index] = item
      } else {
        this._data.push(item)
      }
    })
  }

  /**
   * Remove some columns from existing columns.
   * @param headers
   * The header of the data list to be deleted.
   * @returns
   * Deleted `TableListData`.
   */
  remove(headers: MaybeGroup<string>) {
    const removedList: TableListData[] = []

    group(headers).forEach((header) => {
      const index = this.headers.indexOf(header)
      if (index !== -1) {
        removedList.concat(this._data.splice(index, 1))
      }
    })

    return removedList
  }

  /**
   * Calculate the maximum and minimum values in the current tableList.
   * @remarks
   * This usually requires lists to be of the same type.
   * @returns
   * Return maximum and minimum.
   */
  range(): Vec2 {
    return [
      Number(
        min(this._data.map(({list, min: value}) => min([value, min(list)])))
      ),
      Number(
        max(this._data.map(({list, max: value}) => max([value, max(list)])))
      ),
    ]
  }

  /**
   * Sort the entire row of data by dimension or group weight.
   * @remarks
   * This method mutates the array.
   * @param options
   * The sort configuration.
   */
  sort(options: {
    mode: 'asc' | 'desc'
    targets: 'dimension' | 'groupWeight'
    variant?: 'date'
  }) {
    const {rawTableList, headers} = this,
      {mode, targets, variant} = options,
      getValue = (value: Meta) =>
        variant === 'date' ? new Date(value).getTime() : value

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
