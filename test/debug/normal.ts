import {Chart} from '../../src/chart'
import {DataTableList} from '../../src/data'
import {randomTableList} from '../../src/utils'

export interface DebugLayerProps {
  interval: number
  chart: Chart
}

export function debugRectLayer(props: DebugLayerProps) {
  const {chart, interval} = props,
    data = randomTableList({mode: 'normal', row: 3, column: 2}),
    layers = chart.getLayersByType('rect')

  layers.forEach((layer) => {
    layer.setData(new DataTableList(data))
    layer.draw()
  })

  if (chart.state !== 'destroy') {
    setTimeout(() => debugRectLayer(props), interval)
  }
}
