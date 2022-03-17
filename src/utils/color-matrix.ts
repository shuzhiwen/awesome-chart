import {mean} from 'd3'
import chroma from 'chroma-js'
import {Log} from '../types'
import {createLog} from './create-log'

export class ColorMatrix {
  readonly log: Log = createLog(ColorMatrix.name)

  private _matrix: string[][]

  get matrix() {
    return this._matrix
  }

  constructor(matrix: string[][]) {
    this._matrix = matrix
  }

  get(row: number, column: number) {
    if (row < 0 || column < 0 || row >= this.matrix.length || column >= this.matrix[row]?.length) {
      this.log.warn('get color out of bounds', {row, column})
    }

    while (row < 0) row += this.matrix.length || 1
    while (column < 0) column += this.matrix[row]?.length || 1

    return this.matrix[row % this.matrix.length]?.[
      column % this.matrix[row % this.matrix.length]?.length
    ]
  }

  // nice color matrix
  nice(maxDistance = 85, colorSpace: keyof chroma.ColorSpaces = 'lab') {
    this._matrix = this.matrix.map((row) => {
      if (row.length > 1) {
        let averageDistance = Infinity
        const colorQueue = ['', ...chroma.scale(row).mode('lch').colors(100), '']
        // color crunch
        while (averageDistance > maxDistance && colorQueue.length > row.length) {
          colorQueue.pop()
          colorQueue.shift()
          const colors = chroma.scale(colorQueue).mode('lch').colors(row.length)
          // calculate distance
          const distances: number[] = []
          colors.reduce((prev, cur) => {
            distances.push(chroma.distance(prev, cur, colorSpace))
            return cur
          })
          const newAverageDistance = mean(distances)
          if (newAverageDistance! >= averageDistance) {
            break
          } else {
            averageDistance = newAverageDistance!
          }
        }
        return chroma.scale(colorQueue).mode('lch').colors(row.length)
      }
      return row
    })
  }
}
