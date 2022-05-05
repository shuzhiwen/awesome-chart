import {RawTable, TableDataShape as Shape, TableOptions as Options} from '../types'
import {cloneDeep, min, max, isArray} from 'lodash'
import {isTable} from '../utils'
import {DataBase} from './base'

export class DataTable extends DataBase<RawTable, Options> {
  private _data: Shape = [[], [], []]

  get rows() {
    return this._data[0]
  }

  get columns() {
    return this._data[1]
  }

  get body() {
    return this._data[2]
  }

  constructor(data: RawTable, options: Options = {}) {
    super(data, options)
    this.update(data)
  }

  select(rows: Meta[], columns: Meta[], options: Options = {}) {
    const _rows = isArray(rows) ? rows : [rows],
      _columns = isArray(columns) ? columns : [columns],
      data: RawTable = [_rows, _columns, []],
      rowsIndex = _rows.map((row) => this.rows.findIndex((value) => value === row)),
      columnsIndex = _columns.map((column) => this.columns.findIndex((value) => value === column))

    for (let i = 0; i < rowsIndex.length; i++) {
      const row: Meta[] = []
      for (let j = 0; j < columnsIndex.length; j++) {
        row.push(this.body[columnsIndex[j]][rowsIndex[i]])
      }
      data[2].push(row)
    }

    const result = new DataTable([[], [], []], options)
    result._data = cloneDeep(data)
    return result
  }

  update(table: RawTable) {
    if (!isTable(table)) {
      this.log.error('Illegal data', table)
      return
    }

    this._data = table
  }

  push(target: Options['target'] = 'row', ...data: Meta[][]) {
    data.forEach((item) => {
      if (
        (target === 'row' && item.length !== this.rows.length) ||
        (target === 'column' && item.length !== this.columns.length)
      ) {
        this.log.error('Illegal data')
      } else {
        data.forEach(([dimension, ...values]) => {
          if (target === 'row') {
            this.rows.push(dimension)
            this.body.push(values)
          } else if (target === 'column') {
            this.columns.push(dimension)
            this.body.forEach((rowArray) => rowArray.push(...values))
          }
        })
      }
    })
  }

  remove(target: Options['target'] = 'row', ...data: Meta[]) {
    const removedList: Meta[][] = []
    data.forEach((dimension) => {
      if (target === 'row') {
        const index = this.rows.findIndex((value) => value === dimension)
        index !== -1 && removedList.concat(this.body.splice(index, 1))
      } else if (target === 'column') {
        const index = this.columns.findIndex((value) => value === dimension)
        index !== -1 && removedList.concat(this.body.map((item) => item.splice(index, 1)[0]))
      }
    })
  }

  sort() {
    const result = cloneDeep(this.body),
      column = this.columns.length,
      data = this.body.reduce((prev, cur) => [...prev, ...cur], []),
      order = new Array(data.length).fill(null).map((v, i) => i)

    for (let i = 0; i < data.length; i++) {
      for (let j = i + 1; j < data.length; j++) {
        if (data[i] > data[j]) {
          ;[data[i], data[j]] = [data[j], data[i]]
          ;[order[i], order[j]] = [order[j], order[i]]
        }
      }
    }

    order.forEach((value, i) => (result[Math.floor(value / column)][value % column] = i))
    return result
  }

  range() {
    return [min(this.body.map((row) => min(row))), max(this.body.map((row) => max(row)))]
  }
}
