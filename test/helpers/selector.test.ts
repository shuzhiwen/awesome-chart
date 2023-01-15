import {select} from 'd3'
import {Container} from 'pixi.js'
import {selector} from '../../src'

// disable log message
jest.mock('../../src/utils/create-log', () => ({
  __esModule: true,
  createLog: jest.fn(() => ({
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: {
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
    },
  })),
}))

test('Selector', () => {
  const svgContainer = select(document.createElement('svg'))
  const canvasContainer = new Container()

  expect(selector.createGroup(svgContainer, 'sub')).not.toBeNull()
  expect(selector.createGroup(svgContainer, 'sub')).not.toBeUndefined()
  expect(selector.createGroup(canvasContainer, 'sub')).not.toBeNull()
  expect(selector.createGroup(canvasContainer, 'sub')).not.toBeUndefined()

  expect(selector.setVisible(svgContainer, true))
  expect(selector.setVisible(svgContainer, false))
  expect(selector.setVisible(canvasContainer, true))
  expect(selector.setVisible(canvasContainer, false))

  expect(selector.getDirectChild(svgContainer, 'sub')).not.toBeNull()
  expect(selector.getDirectChild(svgContainer, 'sub')).not.toBeUndefined()
  expect(selector.getDirectChild(canvasContainer, 'sub')).not.toBeNull()
  expect(selector.getDirectChild(canvasContainer, 'sub')).not.toBeUndefined()

  expect(selector.remove(svgContainer)).toBeDefined()
  expect(selector.remove(canvasContainer)).toBeUndefined()
})
