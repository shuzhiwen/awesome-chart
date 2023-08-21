import {Chart, DataTableList, randomTableList} from '../../src'
import {LayerType} from '../../src/types'

const debugTableListLayer =
  (type: Extract<LayerType, 'arc' | 'rect' | 'line' | 'radial'>) =>
  (chart: Chart) => {
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
    chart.rebuildScale({redraw: true})
    layers.length && console.info('Random TableList Data', data)
  }

export const debugArcLayer = debugTableListLayer('arc')
export const debugRectLayer = debugTableListLayer('rect')
export const debugLineLayer = debugTableListLayer('line')
export const debugRadialLayer = debugTableListLayer('radial')
