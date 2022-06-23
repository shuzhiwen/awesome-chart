/* eslint-disable @typescript-eslint/no-unused-vars */
import {Chart} from '../../src/chart'
import {DataTableList} from '../../src/data'
import data from '../../assets/covid19.json'

const rawTableLists = data.map((group) =>
  ([['country', 'count']] as Meta[][]).concat(
    Object.entries(group)
      .filter(([key]) => key !== 'date')
      .map(([key, value]) => [key, Number(value)])
  )
)

const rawTableLists2 = [
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
]

export const debugDynamicRectLayer = (chart: Chart) => {
  const layers = chart.getLayersByType('rect')

  rawTableLists2.forEach((data, i) => {
    setTimeout(() => {
      layers.forEach((layer) => {
        layer.setData(new DataTableList(data))
        layer.update()
      })
      chart.bindCoordinate({redraw: true})
      layers.length && console.info('Random TableList Data', data)
    }, i * 2000)
  })
}
