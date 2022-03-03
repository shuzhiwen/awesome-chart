import {select} from 'd3'
import {fabric} from 'fabric'
import {getEasyGradientCreator} from '../../src/main'

test('defines', () => {
  const svgContainer = select(document.createElement('svg')).append('defs')
  const svgCreator = getEasyGradientCreator({container: svgContainer, engine: 'svg'})
  const canvasCreator = getEasyGradientCreator({container: [], engine: 'canvas'})
  const svgId = svgCreator({
    type: 'linear',
    direction: 'horizontal',
    colors: ['red', 'blue', 'yellow'],
  })
  const fabricGradient = canvasCreator({
    type: 'radial',
    direction: 'vertical',
    colors: ['red', 'blue', 'yellow'],
  })

  expect(typeof svgId === 'string').toBe(true)
  expect(svgContainer.nodes().length).toBeGreaterThan(0)
  expect(fabricGradient instanceof fabric.Gradient).toBe(true)
})
