import {LayerFlopper} from '../../src'
import {Chart} from '../../src/core'
import {DataBase, DataTableList} from '../../src/data'

export const debugDashboardLayer = (chart: Chart) => {
  const data = {
      value: Math.round(Math.random() * 100),
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
    console.info('Random Data', data)
  })
}

export const debugFlopperLayer = (chart: Chart) => {
  const layers = chart.getLayersByType('flopper')

  if (!layers.length) return

  layers.forEach((layer) => {
    const {integerPlace} = (layer as LayerFlopper).style

    layer.setData(new DataBase({value: Math.random() * 10 ** (integerPlace ?? 8)}))
    layer.draw()
    layer.playAnimation()
    console.info('Random Data', layer.data?.source.value)
  })
}

export const debugGridLayer = (chart: Chart) => {
  const layers = chart.getLayersByType('grid'),
    data = [['width', 'height'] as Meta[]].concat(
      new Array(Math.floor(Math.random() * 5) + 10)
        .fill(null)
        .map(() => [Math.floor(Math.random() * 5) + 1, Math.floor(Math.random() * 5) + 1])
    )

  if (!layers.length) return

  layers.forEach((layer) => {
    layer.setData(new DataTableList(data))
    layer.draw()
    layer.playAnimation()
    console.info('Random Data', data)
  })
}
