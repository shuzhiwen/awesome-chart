import {select} from 'd3'
import base from '../../demo/schema/base'
import rect from '../../demo/schema/normal/rect'
import {createChart} from '../../src'

test('defines', () => {
  const svgContainer = document.body.appendChild(document.createElement('div'))
  const canvasContainer = document.body.appendChild(document.createElement('div'))

  select(svgContainer).attr('width', '1000px').attr('height', '1000px')
  select(canvasContainer).attr('width', '1000px').attr('height', '1000px')

  const schema = base(rect({variant: 'column', mode: 'group'}))
  const svgChart = createChart({container: svgContainer, ...schema, engine: 'svg'})
  const canvasChart = createChart({container: svgContainer, ...schema, engine: 'canvas'})
  const charts = [svgChart, canvasChart]

  charts.forEach((chart) => {
    expect(chart?.getLayersByType('text').length === 1)
    expect(chart?.getLayersByType('legend').length === 1)
    expect(chart?.getLayersByType('axis').length === 1)
    expect(chart?.getLayersByType('rect').length === 1)
  })
})
