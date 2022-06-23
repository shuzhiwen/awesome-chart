import {Chart} from '../../src/chart'
import {DataTableList} from '../../src/data'

export const debugDynamicRectLayer = (chart: Chart) => {
  const dataQueue = [
      [
        ['国家', 'AAA', 'BBB'],
        ['俄罗斯', 100, 100],
        ['美国', 50, 100],
        ['中国', 20, 100],
      ],
      [
        ['国家', 'AAA', 'BBB'],
        ['中国', 100, 100],
        ['美国', 50, 100],
        ['俄罗斯', 20, 100],
      ],
      [
        ['国家', 'AAA', 'BBB'],
        ['中国', 100, 100],
        ['俄罗斯', 20, 100],
        ['美国', 50, 100],
      ],
    ],
    layers = chart.getLayersByType('rect')

  dataQueue.forEach((data, i) => {
    setTimeout(() => {
      layers.forEach((layer) => {
        layer.setData(new DataTableList(data))
        layer.update()
      })
      chart.bindCoordinate({redraw: true})
      layers.length && console.info('Random TableList Data', data)
    }, i * 5000)
  })
}
