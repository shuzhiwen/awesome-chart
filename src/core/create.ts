import {DataTableList, DataTable, DataRelation, DataBase} from '../data'
import {CreateChartProps, LayerOptions} from '../types'
import {LayerBase} from '../layers'
import {Chart} from './chart'
import {
  isRawTable,
  isRawTableList,
  isRawRelation,
  tableListToTable,
  randomTableList,
  randomTable,
  isLayerLegend,
  isLayerAxis,
  errorCatcher,
} from '../utils'

export const createLayer = (chart: Chart, schema: ArrayItem<CreateChartProps['layers']>) => {
  const {type, options, data, scale, style, animation, event} = schema!,
    layerOptions = {type, ...options, layout: chart.layout[options.layout]},
    layer = chart.createLayer(layerOptions as LayerOptions) as LayerBase<LayerOptions>
  let dataSet = data

  if (isRawTable(data) || data?.type === 'table') {
    dataSet = new DataTable(isRawTable(data) ? data : randomTable(data))
  } else if (isRawRelation(data)) {
    dataSet = new DataRelation(data)
  } else if (isRawTableList(data) || data?.type === 'tableList') {
    if (type === 'matrix') {
      dataSet = new DataTable(tableListToTable(data)!)
    } else {
      dataSet = new DataTableList(isRawTableList(data) ? data : randomTableList(data))
    }
  } else {
    dataSet = new DataBase(data ?? {})
  }

  layer.setStyle(style)
  layer.setAnimation(animation)
  isLayerAxis(layer) && layer.setScale({nice: scale})
  !isLayerLegend(layer) && layer.setData(dataSet)
  Object.entries(event ?? {}).forEach(([name, fn]) => layer.event.on(name, fn))

  return layer
}

export const createChart = errorCatcher(
  (schema: CreateChartProps, existedChart?: Chart) => {
    const {layers = [], ...initialConfig} = schema
    const chart = existedChart ?? new Chart(initialConfig)

    // define order is draw order
    layers.forEach((layer) => createLayer(chart, layer))
    chart.draw()

    // TODO: control throw
    chart.layers.map((instance) => instance?.playAnimation())

    return chart
  },
  (error) => {
    console.error('Chart initialization failed', error)
  }
)
