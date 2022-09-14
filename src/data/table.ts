import {RawTable, TableDataShape, TableOptions} from '../types'
import {cloneDeep, min, max, isArray} from 'lodash'
import {isRawTable} from '../utils'
import {DataBase} from './base'

export class DataTable extends DataBase<RawTable> {
  private _data: TableDataShape = [[], [], []]

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
      rowsIndex = _rows.map((row) => this.rows.findIndex((value) => value === row)),
      columnsIndex = _columns.map((column) => this.columns.findIndex((value) => value === column))

    for (let i = 0; i < rowsIndex.length; i++) {
      const row: Meta[] = []
      for (let j = 0; j < columnsIndex.length; j++) {
        row.push(this.body[columnsIndex[j]][rowsIndex[i]])
      }
      data[2].push(row)
    }

    const result = new DataTable([[], [], []])
    result._data = cloneDeep(data)
    return result
  }

  update(table: RawTable) {
    if (!isRawTable(table)) {
      this.log.error('Illegal data', table)
      return
    }

    this._data = table
  }

  push(target: TableOptions['target'] = 'row', ...data: Meta[][]) {
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

  remove(target: TableOptions['target'] = 'row', ...data: Meta[]) {
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

  range(): [number, number] {
    return [
      Number(min(this.body.map((row) => min(row)))),
      Number(max(this.body.map((row) => max(row)))),
    ]
  }
}
