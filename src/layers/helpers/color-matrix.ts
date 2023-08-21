import chroma from 'chroma-js'
import {isArray} from 'lodash'
import {DataTableList} from '../../data'
import {CreateColorMatrixProps} from '../../types'
import {ColorMatrix, safeLoop} from '../../utils'

/**
 * Create `ColorMatrix` for the layer.
 * Layer should not create `ColorMatrix` by themselves.
 * @remarks
 * This method is to ensure correct color matching when legend filtering.
 */
export function createColorMatrix(props: CreateColorMatrixProps) {
  const {layer, row, column, theme} = props,
    {main, nice} = layer.options.theme.palette,
    colors = !theme ? main : isArray(theme) ? theme : [theme],
    chromaScale = chroma.scale(colors).mode('lch'),
    order = layer.data?.options.order
  let matrix: string[][] = order?.colorMatrix?.matrix || []

  if (order?.colorMatrix && layer.data instanceof DataTableList) {
    const {type, mapping} = order

    if (type === 'row') {
      matrix = layer.data.lists[0]
        .map((category) => mapping[category])
        .sort()
        .map((index) => matrix[index])
    } else if (type === 'column') {
      const selected = layer.data.headers
        .slice(1)
        .map((header) => mapping[header])
        .sort()
      matrix = matrix.map((row) => selected.map((index) => row[index]))
      if (selected.length === 1) {
        safeLoop(
          () => matrix.length < (layer.data as DataTableList).lists[0].length,
          () => matrix.push(matrix[0])
        )
      }
    }
  } else if (column === 1) {
    matrix = chromaScale.colors(row).map((color) => [color])
  } else {
    chromaScale.colors(row + 1).reduce((prev, cur, index) => {
      matrix.push(
        chroma
          .scale([prev, cur])
          .mode('lch')
          .colors(index === row ? column : column + 1)
      )
      return cur
    })
  }

  const colorMatrix = new ColorMatrix(matrix)

  if (nice && !order?.colorMatrix) {
    colorMatrix.nice(nice.maxDistance, nice.colorSpace)
  }

  return colorMatrix
}
