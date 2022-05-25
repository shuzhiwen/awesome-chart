import {LayerFlopper} from '../../src'
import {Chart} from '../../src/chart'
import {DataBase} from '../../src/data'

export const debugDashboardLayer = (chart: Chart) => {
  const data = {
      value: Math.random() * 100,
      fragments: [
        {start: 0, end: 30, label: '低'},
        {start: 30, end: 60, label: '低'},
        {start: 60, end: 100, label: '低'},
      ],
    },
    layers = chart.getLayersByType('dashboard')

  layers.forEach((layer) => {
    layer.setData(new DataBase(data))
    layer.draw()
    layer.log.info('Random Data', data)
  })
}

export const debugFlopperLayer = (chart: Chart) => {
  const layers = chart.getLayersByType('flopper')

  layers.forEach((layer) => {
    const {integerPlace} = (layer as LayerFlopper).style

    layer.setData(new DataBase({value: Math.random() * 10 ** (integerPlace ?? 8)}))
    layer.draw()
    layer.playAnimation()
    layer.log.info('Random Data', layer.data?.source.value)
  })
}
