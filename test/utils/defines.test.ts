import {select} from 'd3'
import {Texture} from 'pixi.js'
import {getEasyGradientCreator} from '../../src'

test('defines', () => {
  const svgContainer = select(document.createElement('svg')).append('defs')
  const svgCreator = getEasyGradientCreator({container: svgContainer})
  const canvasCreator = getEasyGradientCreator({container: []})
  const svgId = svgCreator({
    type: 'linear',
    direction: 'horizontal',
    colors: ['red', 'blue', 'yellow'],
  })
  const canvasGradient = canvasCreator({
    type: 'radial',
    direction: 'vertical',
    colors: ['red', 'blue', 'yellow'],
  })

  expect(typeof svgId === 'string').toBe(true)
  expect(svgContainer.nodes().length).toBeGreaterThan(0)
  expect(canvasGradient instanceof Texture).toBe(true)
})
