import {Chart, DataTableList, LayerRect, randomTableList} from '../../src'
import {LayerType} from '../../src/types'

const debugTableListLayer =
  (type: Extract<LayerType, 'arc' | 'rect' | 'line' | 'radial' | 'radar'>) =>
  (chart: Chart) => {
    const data = randomTableList({
        mode: 'normal',
        mu: 1000,
        sigma: 200,
        row: 4,
        column: 2,
        sort: 'asc',
      }),
      layers = chart.getLayersByType(type).filter((layer) => {
        // 不包括动态条形图
        if (layer instanceof LayerRect && layer.style.sort !== 'none') {
          return false
        }
        return true
      })

    if (!layers.length) return

    layers.forEach((layer) => {
      layer.setData(new DataTableList(data))
      layer.update()
    })
    chart.rebuildScale({redraw: true})
    layers.length && console.info('Random TableList Data', data)
  }

export const debugArcLayer = debugTableListLayer('arc')
export const debugRectLayer = debugTableListLayer('rect')
export const debugLineLayer = debugTableListLayer('line')
export const debugRadialLayer = debugTableListLayer('radial')
export const debugRadarLayer = debugTableListLayer('radar')
