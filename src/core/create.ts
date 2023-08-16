import {DataBase, DataRelation, DataTable, DataTableList} from '../data'
import {LayerText} from '../layers'
import {CreateChartProps, LayerInstance, LayerOptions} from '../types'
import {
  createLog,
  errorCatcher,
  isLayerAxis,
  isLayerLegend,
  isRawRelation,
  isRawTable,
  isRawTableList,
  randomRelation,
  randomTable,
  randomTableList,
} from '../utils'
import {Chart} from './chart'

const log = createLog('CreateChart')

export const createLayer = (chart: Chart, schema: ArrayItem<CreateChartProps['layers']>) => {
  const {type, options, data, scale, style, animation, event} = schema!,
    layout = options?.layout ? chart.layout[options.layout] : undefined,
    layerOptions = {type, ...options, layout} as LayerOptions,
    layer = chart.createLayer(layerOptions) as LayerInstance
  let dataSet = data

  if (isRawTable(data) || data?.type === 'table') {
    dataSet = new DataTable(isRawTable(data) ? data : randomTable(data))
  } else if (isRawRelation(data) || data?.type === 'relation') {
    dataSet = new DataRelation(isRawRelation(data) ? data : randomRelation(data))
  } else if (isRawTableList(data) || data?.type === 'tableList') {
    dataSet = new DataTableList(isRawTableList(data) ? data : randomTableList(data))
  } else {
    dataSet = new DataBase(data ?? {})
  }

  layer.setStyle(style)
  layer.setAnimation(animation)
  isLayerAxis(layer) && layer.setScale({nice: scale})
  !isLayerLegend(layer) && layer.setData(dataSet)
  Object.entries(event ?? {}).forEach(([name, fn]) => {
    layer.event.on(name as any, 'user', fn)
  })

  return layer
}

export const createChart = errorCatcher(
  (schema: CreateChartProps, existedChart?: Chart) => {
    const {layers = [], onError, ...initialConfig} = schema
    const chart = existedChart ?? new Chart(initialConfig)

    // catch error and info user
    chart.event.on('error', 'user', (data) => {
      if (!onError) {
        chart.destroy()
        const fbChart = new Chart(initialConfig)
        const fallbackLayer = fbChart.createLayer({
          type: 'text',
          id: 'fallback',
          layout: fbChart.layout.container,
        }) as LayerText

        fallbackLayer.setData(new DataBase([data.error?.message ?? '']))
        fallbackLayer.setStyle({text: {align: ['middle', 'middle']}})
        fallbackLayer.draw()
      } else {
        onError(data)
      }
    })

    // define order is draw order
    layers.forEach((layer) => createLayer(chart, layer))
    chart.layers.forEach((layer) => layer.setVisible(false))
    chart.draw()

    // not visible until animation initialized
    chart.layers.forEach((layer) => {
      const enterAnimations = Object.values(layer.cacheAnimation.animations)
        .map((animation) => animation?.queue.find(({options: {id}}) => id === 'enter'))
        .filter(Boolean)
      const batchAnimation = enterAnimations.map((animation) => {
        return new Promise<void>((resolve) => {
          animation?.event.on('init', 'system', () => resolve())
        })
      })
      Promise.all(batchAnimation).then(() => {
        layer.setVisible(true)
        if (batchAnimation.length) {
          log.info('Layer animation Initialized!')
        }
      })
    })

    // start animation (consider transfer control)
    chart.layers.map((instance) => instance?.playAnimation())

    return chart
  },
  (error: Error) => {
    log.error('Chart initialization failed', error)
  }
)
