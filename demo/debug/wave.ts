import {Chart} from '../../src/core'
import {DataBase} from '../../src/data'

export const debugWaveLayer = (chart: Chart) => {
  const value = Math.round(Math.random() * 100),
    layers = chart.getLayersByType('wave')

  layers.forEach((layer) => {
    layer.setData(new DataBase({value, maxValue: 100}))
    layer.draw()
    console.info('Random Data', value)
  })
}
