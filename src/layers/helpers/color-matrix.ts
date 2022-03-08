import chroma from 'chroma-js'
import {isArray} from 'lodash'
import {DataTableList} from '../../data'
import {ColorMatrix} from '../../utils'
import {CreateColorMatrixProps} from '../../types'

export function createColorMatrix(props: CreateColorMatrixProps) {
  const {layer, row, column, theme, nice} = props,
    order = layer.data?.options.order,
    colors = !theme ? layer.options.theme : isArray(theme) ? theme : [theme],
    chromaScale = chroma.scale(colors).mode('lch')
  let matrix: string[][] = []

  if (order?.colorMatrix && layer.data instanceof DataTableList) {
    const {type, mapping} = order,
      data = layer.data?.data

    if (type === 'row') {
      matrix = data[0].list
        .map((dimension) => mapping[dimension])
        .sort()
        .map((index) => matrix[index])
    } else if (type === 'column') {
      const selected = data
        .slice(1)
        .map(({header}) => mapping[header])
        .sort()
      matrix = matrix.map((row) => selected.map((index) => row[index]))
      if (selected.length === 1) {
        while (matrix.length < data[0].list.length) {
          matrix.push(matrix[0])
        }
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
  nice && !order?.colorMatrix && colorMatrix.nice()
  return colorMatrix
}
