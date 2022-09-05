import {Chart} from '../../src/core'
import {DataTableList} from '../../src/data'
import {randomTableList} from '../../src/utils'

type TableListLayerType = 'arc' | 'rect' | 'line' | 'radial'

const debugTableListLayer = (type: TableListLayerType) => (chart: Chart) => {
  const data = randomTableList({
      mode: 'normal',
      mu: 1000,
      sigma: 200,
      row: 4,
      column: 2,
      sort: 'asc',
    }),
    layers = chart.getLayersByType(type)

  if (!layers.length) return

  layers.forEach((layer) => {
    layer.setData(new DataTableList(data))
    layer.update()
  })
  chart.bindCoordinate({redraw: true})
  layers.length && console.info('Random TableList Data', data)
}

export const debugArcLayer = debugTableListLayer('arc')
export const debugRectLayer = debugTableListLayer('rect')
export const debugLineLayer = debugTableListLayer('line')
export const debugRadialLayer = debugTableListLayer('radial')
