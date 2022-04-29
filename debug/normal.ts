import {Chart} from '../src/chart'
import {DataTableList} from '../src/data'
import {randomTableList} from '../src/utils'

export function debugRectLayer(chart: Chart) {
  const data = randomTableList({mode: 'normal', mu: 100, sigma: 1000, row: 3, column: 2}),
    layers = chart.getLayersByType('rect')

  layers.forEach((layer) => {
    layer.setData(new DataTableList(data))
    layer.update()
    chart.bindCoordinate()
    chart.layers.forEach((layer) => layer.draw())
  })

  console.log('RandomData', data)
}
