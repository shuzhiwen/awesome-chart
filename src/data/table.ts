import {cloneDeep, min, max} from 'lodash'
import {createEvent, createLog, isTable, isTableList, tableListToTable} from '../utils'
import {DataBase} from './base'
import {
  Meta,
  RawTable as Input,
  TableDataShape as Shape,
  TableOptions as Options,
  RawTableList,
  RawTable,
} from '../types'

export class Table extends DataBase<RawTable, Options> {
  readonly log = createLog('data:table')

  readonly event = createEvent('data:table')

  private _data: Shape = [[], [], []]

  get data() {
    return this._data
  }

  constructor(table: Input, options: Options = {}) {
    super({source: table, options})
    this.update(table)
  }

  // get subset of the table without changing previous data
  select(rows: Meta[], columns: Meta[], options: Options) {
    const _rows = Array.isArray(rows) ? rows : [rows]
    const rowsIndex = _rows.map((row) => this.data[0].findIndex((value) => value === row))
    const _columns = Array.isArray(columns) ? columns : [columns]
    const columnsIndex = _columns.map((column) =>
      this.data[1].findIndex((value) => value === column)
    )
    const data: RawTable = [_rows, _columns, []]
    for (let i = 0; i < rowsIndex.length; i++) {
      let row: Meta[] = []
      for (let j = 0; j < columnsIndex.length; j++) {
        row.push(this.data[2][columnsIndex[j]][rowsIndex[i]])
      }
      data[2].push(row)
    }
    // HACK: create a new table
    const result = new Table([[], [], []], options)
    result._data = cloneDeep(data)
    return result
  }

  update(table: Input) {
    if (!isTable(table)) {
      this.log.error('illegal data', table)
      if (isTableList(table)) {
        table = tableListToTable(table as RawTableList)!
      }
    }
    this._data = table
  }

  // append items to the list
  push(target: Options['target'] = 'row', ...data: Meta[][]) {
    data.forEach((item) => {
      if (
        (target === 'row' && item.length !== this.data[0].length) ||
        (target === 'column' && item.length !== this.data[1].length)
      ) {
        this.log.error('illegal data')
      } else {
        data.forEach(([dimension, ...values]) => {
          if (target === 'row') {
            this.data[0].push(dimension)
            this.data[2].push(values)
          } else if (target === 'column') {
            this.data[1].push(dimension)
            this.data[2].forEach((rowArray) => rowArray.push(...values))
          }
        })
      }
    })
  }

  // remove items from the list
  remove(target: Options['target'] = 'row', ...data: Meta[]) {
    const removedList: Meta[][] = []
    data.forEach((dimension) => {
      if (target === 'row') {
        const index = this.data[0].findIndex((value) => value === dimension)
        index !== -1 && removedList.concat(this.data[2].splice(index, 1))
      } else if (target === 'column') {
        const index = this.data[1].findIndex((value) => value === dimension)
        index !== -1 && removedList.concat(this.data[2].map((item) => item.splice(index, 1)[0]))
      }
    })
    return removedList
  }

  sort() {
    const result = cloneDeep(this.data[2])
    const column = this.data[1].length
    const data = this.data[2].reduce((prev, cur) => [...prev, ...cur], [])
    const order = new Array(data.length).fill(null).map((v, i) => i)
    for (let i = 0; i < data.length; i++) {
      for (let j = i + 1; j < data.length; j++) {
        if (data[i] > data[j]) {
          ;[data[i], data[j]] = [data[j], data[i]]
          ;[order[i], order[j]] = [order[j], order[i]]
        }
      }
    }
    // order data
    order.forEach((value, i) => (result[Math.floor(value / column)][value % column] = i))
    return result
  }

  range() {
    return [min(this.data[2].map((row) => min(row))), max(this.data[2].map((row) => max(row)))]
  }
}
