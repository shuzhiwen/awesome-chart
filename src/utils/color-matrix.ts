import {mean} from 'd3'
import chroma from 'chroma-js'
import {createLog} from './create-log'
import {safeLoop} from './chaos'

export class ColorMatrix {
  readonly log = createLog(ColorMatrix.name)

  private _matrix: string[][]

  /**
   * The color matrix represents the colors of the DataTableList etc.
   * One-to-one correspondence between colors and chart element or group.
   */
  get matrix() {
    return this._matrix
  }

  constructor(matrix: string[][]) {
    this._matrix = matrix
  }

  /**
   * Get one color from color matrix.
   * @remark
   * If the coordinates are outside the range of the matrix, the colors will be cycled.
   * @param row
   * The row index of colors representing the `dimension`.
   * @param column
   * The column index of color representing the `category`.
   * @returns
   * The color corresponding to the data element.
   */
  get(row: number, column: number) {
    if (row < 0 || column < 0 || row >= this.matrix.length || column >= this.matrix[row]?.length) {
      this.log.debug.warn('Get color out of bounds', {row, column, matrix: this.matrix})
    }

    safeLoop(
      () => row < 0,
      () => (row += this.matrix.length || 1)
    )
    safeLoop(
      () => column < 0,
      () => (column += this.matrix[row]?.length || 1)
    )

    return this.matrix[row % this.matrix.length]?.[
      column % this.matrix[row % this.matrix.length]?.length
    ]
  }

  /**
   * Narrow the gap between colors for aesthetics.
   * @param maxDistance
   * The color distance of specific color space.
   * @param colorSpace
   * The color represent method such as `rgb` or `hsl`.
   */
  nice(maxDistance = 85, colorSpace: Keys<chroma.ColorSpaces> = 'lab') {
    this._matrix = this.matrix.map((row) => {
      if (row.length > 1) {
        let averageDistance = Infinity
        const colorQueue = ['', ...chroma.scale(row).mode('lch').colors(100), '']
        /**
         * Narrow util distance smaller then distance.
         * Note that this loop may not be used once.
         */
        const times = safeLoop(
          () => averageDistance > maxDistance && colorQueue.length > row.length,
          () => {
            colorQueue.pop()
            colorQueue.shift()

            const colors = chroma.scale(colorQueue).mode('lch').colors(row.length)
            const distances: number[] = []

            colors.reduce((prev, cur) => {
              distances.push(chroma.distance(prev, cur, colorSpace))
              return cur
            })

            const newAverageDistance = mean(distances)

            if (newAverageDistance! >= averageDistance) {
              return false
            } else {
              averageDistance = newAverageDistance!
            }
          }
        )

        if (times === 0) {
          colorQueue.pop()
          colorQueue.shift()
        }

        return chroma.scale(colorQueue).mode('lch').colors(row.length)
      }

      return row
    })
  }
}
