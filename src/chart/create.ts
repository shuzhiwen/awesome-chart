import {isArray} from 'lodash'
import {DataTableList, DataTable, DataRelation, DataBase} from '../data'
import {CreateChartSchema, CreateLayerSchema} from '../types'
import {Chart} from './chart'
import {
  createLog,
  isTable,
  isTableList,
  isRelation,
  relationToTable,
  tableListToTable,
  randomTableList,
  randomTable,
  isLayerLegend,
  isLayerAxis,
} from '../utils'

const log = createLog('CreateChart')

export const createLayer = (chart: Chart, schema: CreateLayerSchema) => {
  const {type, options, data, scale, style, animation, event} = schema
  const layer = chart.createLayer(type, {...options, layout: chart.layout[options.layout]})
  let dataSet = data

  if (type === 'legend' && isLayerLegend(layer)) {
    layer.bindLayers(chart.layers)
  } else if (isTable(data) || data?.type === 'table') {
    dataSet = new DataTable(isTable(data) ? data : randomTable(data))
  } else if (isArray(data) && data.length === 2 && isRelation(data)) {
    if (type === 'chord') {
      dataSet = new DataTable(relationToTable(data)!)
    } else {
      dataSet = new DataRelation(data)
    }
  } else if (type !== 'indicator' && (isTableList(data) || data?.type === 'tableList')) {
    if (type === 'matrix') {
      dataSet = new DataTable(tableListToTable(data)!)
    } else {
      dataSet = new DataTableList(isTableList(data) ? data : randomTableList(data))
    }
  } else {
    dataSet = new DataBase(data ?? {}, {})
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
      legendLayerConfig = layers.find(({type}) => type === 'legend'),
      interactiveConfig = layers.find(({type}) => type === 'interactive'),
      normalLayerConfigs = layers.filter(
        ({type}) => type !== 'axis' && type !== 'legend' && type !== 'interactive'
      )

    // layer instance
    axisLayerConfig && createLayer(chart, axisLayerConfig)
    normalLayerConfigs.forEach((layer) => createLayer(chart, layer).update())
    // legend and interactive is the last one
    legendLayerConfig && createLayer(chart, legendLayerConfig)
    interactiveConfig && createLayer(chart, interactiveConfig)
    // axis layer control all scales
    axisLayerConfig && chart.bindCoordinate()
    // draw in order with schema
    layers.forEach(({options}) => {
      chart.layers.find(({options: {id}}) => id === options.id)?.draw()
    })

    // TODO: throw and give control to users
    setTimeout(() => chart.layers.map((instance) => instance?.playAnimation()))

    return chart
  } catch (error) {
    log.error('Chart initialization failed', error)
  }
}
