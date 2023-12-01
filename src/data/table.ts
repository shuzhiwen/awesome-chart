import {max, min} from 'lodash'
import {RawTable, TableOptions} from '../types'
import {group, isRawTable} from '../utils'
import {DataBase} from './base'

export class DataTable extends DataBase<RawTable> {
  private _data: RawTable = [[], [], []]

  /**
   * Row keys of the table.
   */
  get rows() {
    return this._data[0]
  }

  /**
   * Column keys of the table.
   */
  get columns() {
    return this._data[1]
  }

  /**
   * Matrix data of the table.
   */
  get body() {
    return this._data[2]
  }

  constructor(data: RawTable) {
    super(data)

    if (isRawTable(data)) {
      this._data = data
    } else {
      throw new Error('Illegal data')
    }
  }

  /**
   * Select to generate a submatrix.
   * @param rows
   * The rows of the submatrix.
   * @param columns
   * The columns of the submatrix.
   * @returns
   * New `DataTable` containing specific rows and columns.
   */
  select(rows: Meta[], columns: Meta[]) {
    const _rows = group(rows),
      _columns = group(columns),
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

    return new DataTable(data)
  }

  /**
   * Append rows or columns to the current table.
   * @param target
   * Operating mode.
   * @param data
   * Append data with row name or column name.
   */
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

  /**
   * Remove rows or columns from the current table.
   * @param target
   * Operating mode.
   * @param data
   * Array of rows or columns.
   */
  remove(target: TableOptions['target'] = 'row', ...data: Meta[]) {
    const removedList: Meta[][] = []

    data.forEach((dimension) => {
      if (target === 'row') {
        const index = this.rows.indexOf(dimension)
        index !== -1 && removedList.concat(this.body.splice(index, 1))
      } else if (target === 'column') {
        const index = this.columns.indexOf(dimension)
        index !== -1 &&
          removedList.concat(this.body.map((item) => item.splice(index, 1)[0]))
      }
    })
  }

  /**
   * Calculate the maximum and minimum values in the current table.
   * @remarks
   * This usually requires lists to be of the same type.
   * @returns
   * Return maximum and minimum.
   */
  range(): Vec2 {
    return [
      Number(min(this.body.map((row) => min(row)))),
      Number(max(this.body.map((row) => max(row)))),
    ]
  }
}
