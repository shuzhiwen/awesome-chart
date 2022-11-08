import {DataTableList, DataTable, DataRelation, DataBase} from '../data'
import {CreateChartProps, LayerOptions} from '../types'
import {LayerBase} from '../layers'
import {Chart} from './chart'
import {
  createLog,
  isRawTable,
  isRawTableList,
  isRawRelation,
  tableListToTable,
  randomTableList,
  randomTable,
  isLayerLegend,
  isLayerAxis,
  errorCatcher,
  dependantLayers,
} from '../utils'

const log = createLog('CreateChart')

export const createLayer = errorCatcher(
  (chart: Chart, schema: ArrayItem<CreateChartProps['layers']>) => {
    const {type, options, data, scale, style, animation, event} = schema!,
      layerOptions = {type, ...options, layout: chart.layout[options.layout]} as LayerOptions,
      layer = chart.createLayer(layerOptions) as LayerBase<LayerOptions>
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
    layer.setAnimation({...animation})
    isLayerAxis(layer) && layer.setScale({nice: scale})
    !isLayerLegend(layer) && layer.setData(dataSet)
    Object.entries(event ?? {}).forEach(([name, fn]) => layer.event.on(name, fn))

    return layer
  },
  (error) => {
    log.error('CreateLayer failed', error)
  }
)

export const createChart = errorCatcher(
  (schema: CreateChartProps, existedChart?: Chart) => {
    const {layers = [], ...initialConfig} = schema,
      chart = existedChart ?? new Chart(initialConfig),
      axisLayerConfig = layers.find(({type}) => type === 'axis'),
      normalLayerConfigs = layers.filter(({type}) => !dependantLayers.has(type))

    // define order is draw order
    layers.forEach((layer) => createLayer(chart, layer))

    normalLayerConfigs.forEach(({type}) =>
      chart.getLayersByType(type).forEach((layer) => layer.update())
    )

    const legendLayer = chart.getLayersByType('legend')[0]
    isLayerLegend(legendLayer) && legendLayer.bindLayers(chart.layers)

    axisLayerConfig && chart.bindCoordinate({redraw: false})
    chart.draw()

    chart.layers.map((instance) => instance?.playAnimation())

    return chart
  },
  (error) => {
    log.error('Chart initialization failed', error)
  }
)
