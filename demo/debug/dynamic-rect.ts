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
  const layers = chart.getLayersByType('rect').filter((item) => (item as LayerRect).options.sort)

  if (!layers.length) return

  dynamicRawTableLists.forEach((data, i) => {
    setTimeout(() => {
      layers.forEach((layer) => {
        layer.setData(new DataTableList(data))
        layer.update()
      })
      chart.rebuildScale({redraw: true})
      layers.length && console.info('Random TableList Data', data)
    }, i * 500)
  })
}
