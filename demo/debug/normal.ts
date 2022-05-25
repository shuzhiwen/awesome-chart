import {Chart} from '../../src/chart'
import {DataTableList} from '../../src/data'
import {randomTableList} from '../../src/utils'

type TableListLayerType = 'arc' | 'rect' | 'line'

export const debugTableListLayer = (type: TableListLayerType) => (chart: Chart) => {
  const data = randomTableList({
      mode: 'normal',
      mu: 100,
      sigma: 1000,
      row: 3,
      column: 1 + Math.round(Math.random() * 2),
    }),
    layers = chart.getLayersByType(type)

  layers.forEach((layer) => {
    layer.setData(new DataTableList(data))
    layer.update()
  })
  chart.bindCoordinate({redraw: true})
  layers.length && console.info('Random TableList Data', data)
}

export const debugTableListLayers = [
  debugTableListLayer('arc'),
  debugTableListLayer('line'),
  debugTableListLayer('rect'),
]
