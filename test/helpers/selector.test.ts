import {select} from 'd3'
import {fabric} from 'fabric'
import {Selector} from '../../src'

// disable log message
jest.mock('../../src/utils/create-log', () => ({
  __esModule: true,
  createLog: jest.fn(() => ({
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  })),
}))

test('Selector', () => {
  const svgContainer = select(document.createElement('svg'))
  const svgSelector = new Selector('svg')
  const canvasContainer = new fabric.Canvas(document.createElement('canvas'))
  const canvasSelector = new Selector('canvas')

  expect(svgSelector.createSubcontainer(svgContainer, 'sub')).not.toBeNull()
  expect(svgSelector.createSubcontainer(svgContainer, 'sub')).not.toBeUndefined()
  expect(canvasSelector.createSubcontainer(canvasContainer, 'sub')).not.toBeNull()
  expect(canvasSelector.createSubcontainer(canvasContainer, 'sub')).not.toBeUndefined()

  expect(svgSelector.setVisible(svgContainer, true))
  expect(svgSelector.setVisible(svgContainer, false))
  expect(canvasSelector.setVisible(canvasContainer, true))
  expect(canvasSelector.setVisible(canvasContainer, false))

  expect(svgSelector.getSubcontainer(svgContainer, 'sub')).not.toBeNull()
  expect(svgSelector.getSubcontainer(svgContainer, 'sub')).not.toBeUndefined()
  expect(canvasSelector.getSubcontainer(canvasContainer, 'sub')).not.toBeNull()
  expect(canvasSelector.getSubcontainer(canvasContainer, 'sub')).not.toBeUndefined()

  expect(svgSelector.remove(svgContainer)).toBeDefined()
  expect(canvasSelector.remove(canvasContainer)).toBeDefined()
})
