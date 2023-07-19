import {Chart, DataRelation, randomRelation} from '../../src'
import {LayerType} from '../../src/types'

const debugRelationLayer = (type: Extract<LayerType, 'sankey'>) => (chart: Chart) => {
  const data = randomRelation({
      mode: 'normal',
      mu: 1000,
      sigma: 200,
      node: 10,
      density: 0.7,
      level: 3,
    }),
    layers = chart.getLayersByType(type)

  if (!layers.length) return

  layers.forEach((layer) => {
    layer.setData(new DataRelation(data))
    layer.draw()
  })
  layers.length && console.info('Random Relation Data', data)
}

export const debugSankeyLayer = debugRelationLayer('sankey')
