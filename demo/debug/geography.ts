import {path as d3Path} from 'd3-path'
import {Chart} from '../../src/core'

export const debugODLineLayer = (chart: Chart) => {
  const path = d3Path(),
    layers = chart.getLayersByType('odLine')

  if (!layers.length) return

  path.moveTo(0, 0)
  path.lineTo(-30, 10)
  path.lineTo(-30, -10)
  path.closePath()

  layers.forEach((layer) => {
    layer.setStyle({
      flyingObject: {
        path: path.toString(),
      },
    })
    layer.draw()
  })
}
