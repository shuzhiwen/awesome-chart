import {DataTableList, DataTable, DataRelation, DataBase} from '../data'
import {CreateChartSchema, CreateLayerSchema, LayerOptions} from '../types'
import {Chart} from './chart'
import {
  createLog,
  isTable,
  isTableList,
  isRelation,
  tableListToTable,
  randomTableList,
  randomTable,
  isLayerLegend,
  isLayerAxis,
} from '../utils'

const log = createLog('CreateChart')
const specialLayers = ['axis', 'legend', 'interactive', 'mark']

export const createLayer = (chart: Chart, schema: CreateLayerSchema) => {
  const {type, options, data, scale, style, animation, event} = schema,
    layerOptions = {type, ...options, layout: chart.layout[options.layout]} as LayerOptions,
    layer = chart.createLayer(layerOptions)
  let dataSet = data

  if (type === 'legend' && isLayerLegend(layer)) {
    layer.bindLayers(chart.layers)
  } else if (isTable(data) || data?.type === 'table') {
    dataSet = new DataTable(isTable(data) ? data : randomTable(data))
  } else if (isRelation(data)) {
    dataSet = new DataRelation(data)
  } else if (isTableList(data) || data?.type === 'tableList') {
    if (type === 'matrix') {
      dataSet = new DataTable(tableListToTable(data)!)
    } else {
      dataSet = new DataTableList(isTableList(data) ? data : randomTableList(data))
    }
  } else {
    dataSet = new DataBase(data ?? {})
  }

  layer.setStyle({...style})
  layer.setAnimation({...animation})
  isLayerAxis(layer) && layer.setScale({nice: scale})
  !isLayerLegend(layer) && layer.setData(dataSet)
  event && Object.keys(event).forEach((name) => layer.event.on(name, event[name]))

  return layer
}

export const createChart = (schema: CreateChartSchema, existedChart?: Chart) => {
  try {
    const {layers = [], ...initialConfig} = schema,
      chart = existedChart ?? new Chart(initialConfig),
      axisLayerConfig = layers.find(({type}) => type === 'axis'),
      normalLayerConfigs = layers.filter(({type}) => !specialLayers.includes(type))

    // layer instance
    axisLayerConfig && createLayer(chart, axisLayerConfig)
    normalLayerConfigs.forEach((layer) => createLayer(chart, layer).update())
    // special layers need scale
    specialLayers
      .filter((type) => type !== 'axis')
      .flatMap((type) => layers.filter((item) => item.type === type)!)
      .filter(Boolean)
      .map((config) => createLayer(chart, config))
    // axis layer control all scales
    axisLayerConfig && chart.bindCoordinate({redraw: false})
    chart.draw()
    // TODO: throw and give control to users
    setTimeout(() => chart.layers.map((instance) => instance?.playAnimation()))

    return chart
  } catch (error) {
    log.error('Chart initialization failed', error)
  }
}
