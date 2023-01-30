import {RawTable, TableOptions} from '../types'
import {min, max, isArray} from 'lodash'
import {isRawTable} from '../utils'
import {DataBase} from './base'

export class DataTable extends DataBase<RawTable> {
  private _data: RawTable = [[], [], []]

  get rows() {
    return this._data[0]
  }

  get columns() {
    return this._data[1]
  }

  get body() {
    return this._data[2]
  }

  constructor(data: RawTable) {
    super(data)
    this.update(data)
  }

  select(rows: Meta[], columns: Meta[]) {
    const _rows = isArray(rows) ? rows : [rows],
      _columns = isArray(columns) ? columns : [columns],
      data: RawTable = [_rows, _columns, []],
      rowsIndex = _rows.map((row) => this.rows.indexOf(row)),
      columnsIndex = _columns.map((column) => this.columns.indexOf(column))

    for (let i = 0; i < rowsIndex.length; i++) {
      const row: Meta[] = []
      for (let j = 0; j < columnsIndex.length; j++) {
        row.push(this.body[columnsIndex[j]][rowsIndex[i]])
      }
      data[2].push(row)
    }

    const result = new DataTable(data)

    return result
  }

  update(table: RawTable) {
    if (!isRawTable(table)) throw new Error('Illegal data')
    this._data = table
  }

  push(target: TableOptions['target'] = 'row', ...data: Meta[][]) {
    data.forEach((item) => {
      if (
        (target === 'row' && item.length !== this.rows.length) ||
        (target === 'column' && item.length !== this.columns.length)
      ) {
        throw new Error('Illegal data')
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

  remove(target: TableOptions['target'] = 'row', ...data: Meta[]) {
    const removedList: Meta[][] = []

    data.forEach((dimension) => {
      if (target === 'row') {
        const index = this.rows.indexOf(dimension)
        index !== -1 && removedList.concat(this.body.splice(index, 1))
      } else if (target === 'column') {
        const index = this.columns.indexOf(dimension)
        index !== -1 && removedList.concat(this.body.map((item) => item.splice(index, 1)[0]))
      }
    })
  }

  range(): Vec2 {
    return [
      Number(min(this.body.map((row) => min(row)))),
      Number(max(this.body.map((row) => max(row)))),
    ]
  }
}
