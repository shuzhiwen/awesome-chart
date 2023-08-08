import data from '../../public/covid19.json'
import {Chart} from '../../src/core'
import {DataTableList} from '../../src/data'
import {LayerRect} from '../../src/layers'

export const dynamicRawTableLists = data.map((group) =>
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
    ['俄罗斯', 50, 100],
    ['美国', 20, 100],
  ],
]

export const debugDynamicRectLayer = (chart: Chart) => {
  dynamicRawTableLists.forEach((data, i) => {
    setTimeout(() => {
      const layers = chart.getLayersByType('rect').filter((item) => {
        return (item as LayerRect).options.sort
      })
      if (layers.length) {
        layers.forEach((layer) => {
          layer.setData(new DataTableList(data))
          layer.update()
        })
        chart.rebuildScale({redraw: true})
        console.info('Random TableList Data', data)
      }
    }, i * 500)
  })
}
