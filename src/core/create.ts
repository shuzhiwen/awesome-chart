import {DataTableList, DataTable, DataRelation, DataBase} from '../data'
import {CreateChartProps, LayerOptions} from '../types'
import {LayerBase, LayerText} from '../layers'
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
    const {layers = [], onError, ...initialConfig} = schema
    const chart = existedChart ?? new Chart(initialConfig)

    // define order is draw order
    layers.forEach((layer) => createLayer(chart, layer))
    chart.layers.forEach((layer) => layer.setVisible(false))
    chart.draw()

    // not visible until animation initialized
    chart.layers.forEach((layer) => {
      const enterAnimations = Object.values(layer.cacheAnimation.animations)
        .filter((animation) => animation?.queue[1])
        .map((animation) => animation?.queue[1])
      if (enterAnimations.length === 0) {
        layer.setVisible(true)
      } else {
        Promise.all(
          enterAnimations.map((animation) => {
            return new Promise<void>((resolve) => {
              animation?.event.on('init', () => resolve())
            })
          })
        ).then(() => layer.setVisible(true))
      }
    })

    // catch error and info user
    chart.event.on('error', (data: any) => {
      if (!onError) {
        chart.destroy()
        throw {...data, fbChart: new Chart(initialConfig)}
      } else {
        onError(data)
      }
    })

    // start animation (consider transfer control)
    chart.layers.map((instance) => instance?.playAnimation())

    return chart
  },
  (error: Error | {error?: Error; fbChart: Chart}) => {
    if (error instanceof Error) {
      console.error('Chart initialization failed', error)
    } else {
      const fallbackLayer = error.fbChart.createLayer({
        type: 'text',
        id: 'fallback',
        layout: error.fbChart.layout.container,
      }) as LayerText

      fallbackLayer.setData(new DataBase([error?.error?.message ?? '']))
      fallbackLayer.setStyle({text: {align: ['middle', 'middle']}})
      fallbackLayer.draw()
    }
  }
)
