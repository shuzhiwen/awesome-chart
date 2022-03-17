import {isArray} from 'lodash'
import {DataTableList, DataTable, DataRelation, DataBase} from '../data'
import {LayerType, CreateChartSchema, CreateLayerSchema} from '../types'
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
} from '../utils'

const isAxisLayer = (type: LayerType) => type === 'axis'
const isLegendLayer = (type: LayerType) => type === 'legend'
const isNormalLayer = (type: LayerType) => !isAxisLayer(type) && !isLegendLayer(type)
const log = createLog('CreateChart')

export const createLayer = (chart: Chart, schema: CreateLayerSchema) => {
  const {type, options, data, style, animation, event} = schema
  const layer = chart.createLayer(type, {...options, layout: chart.layout[options.layout]})
  let dataSet = data

  if (type === 'legend') {
    dataSet = chart.layers
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
    dataSet = new DataBase(data, {})
  }

  layer.setData(dataSet)
  layer.setStyle(style || {})
  layer.setAnimation(animation || {})

  if (event) {
    Object.keys(event).forEach((eventName) => layer.event.on(eventName, event[eventName]))
  }

  return layer
}

export const createChart = (schema: CreateChartSchema, existedChart?: Chart) => {
  try {
    const {layers = [], afterCreate, ...initialConfig} = schema
    const chart = existedChart ?? new Chart(initialConfig)
    // some special layers require data or scales from other layers
    const normalLayerConfigs = layers.filter(({type}) => isNormalLayer(type))
    const axisLayerConfig = layers.find(({type}) => isAxisLayer(type))
    const legendLayerConfig = layers.find(({type}) => isLegendLayer(type))

    // layer instance
    normalLayerConfigs.forEach((layer) => createLayer(chart, layer))
    axisLayerConfig && createLayer(chart, axisLayerConfig)
    // axis layer control all scales
    axisLayerConfig && chart.bindCoordinate()
    // legend layer is the last one
    legendLayerConfig && createLayer(chart, legendLayerConfig)
    // draw in order with schema
    layers.forEach(({options}) => {
      chart.layers.find(({options: {id}}) => id === options.id)?.draw()
    })
    // TODO: throw and give control to users
    setTimeout(() => chart.layers.map((instance) => instance?.playAnimation()))
    // callback after create
    afterCreate?.(chart)

    return chart
  } catch (error) {
    log.error('Chart initialization failed', error)
  }
}
