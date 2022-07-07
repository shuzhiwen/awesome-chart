import {isArray} from 'lodash'
import {fabric} from 'fabric'
import {DrawerDataShape, RectDrawerProps} from '../types'
import {IRectOptions} from 'fabric/fabric-impl'
import {svgEasing} from '../animation'
import {mergeAlpha, getAttr, isSvgContainer, isCanvasContainer, noChange} from '../utils'

export function drawRect({
  fill,
  stroke,
  strokeWidth,
  opacity,
  fillOpacity,
  strokeOpacity,
  transformOrigin,
  mapping = noChange,
  source = [],
  data = [],
  transition,
  container,
  className,
  theme,
}: RectDrawerProps) {
  const {
    graph,
    animation: {update},
  } = theme
  const configuredData = data.map((item, i) => ({
    ...item,
    className,
    fill: getAttr(fill, i, graph.fill),
    stroke: getAttr(stroke, i, graph.stroke),
    opacity: getAttr(opacity, i, graph.opacity),
    fillOpacity: getAttr(fillOpacity, i, graph.fillOpacity),
    strokeOpacity: getAttr(strokeOpacity, i, graph.strokeOpacity),
    strokeWidth: getAttr(strokeWidth, i, graph.strokeWidth),
    transformOrigin: getTransformOrigin(item, getAttr(transformOrigin, i, '')),
    source: getAttr(source, i, null),
  }))
  const mappedData = configuredData.map((datum) => {
    return mapping(datum) as typeof datum
  })

  if (isSvgContainer(container)) {
    container
      .selectAll(`.${className}`)
      .data(mappedData)
      .join('rect')
      .attr('class', (d) => d.className)
      .transition()
      .ease(svgEasing.get(transition?.easing ?? update.easing)!)
      .duration(transition?.duration ?? update.duration)
      .delay(transition?.delay ?? update.delay)
      .attr('x', (d) => d.x)
      .attr('y', (d) => d.y)
      .attr('rx', (d) => d.rx || 0)
      .attr('ry', (d) => d.ry || 0)
      .attr('width', (d) => d.width)
      .attr('height', (d) => d.height)
      .attr('fill', (d) => d.fill)
      .attr('stroke', (d) => d.stroke)
      .attr('stroke-width', (d) => d.strokeWidth)
      .attr('fill-opacity', (d) => d.fillOpacity)
      .attr('stroke-opacity', (d) => d.strokeOpacity)
      .attr('opacity', (d) => d.opacity)
      .attr('transform-origin', (d) => d.transformOrigin)
  }

  if (isCanvasContainer(container)) {
    container.remove(...container.getObjects())
    mappedData.forEach((config) => {
      const rect = new fabric.Rect({
        className: config.className,
        top: config.y,
        left: config.x,
        width: config.width,
        height: config.height,
        rx: config.rx,
        ry: config.ry,
        fill: mergeAlpha(config.fill, config.fillOpacity),
        stroke: mergeAlpha(config.stroke, config.strokeOpacity),
        strokeWidth: config.strokeWidth,
        opacity: config.opacity,
        source: config.source,
      } as IRectOptions)
      container.addWithUpdate(rect)
    })
  }
}

const getTransformOrigin = (
  data: DrawerDataShape<RectDrawerProps>,
  transformOrigin: ArrayItem<RectDrawerProps['transformOrigin']>
) => {
  let result = ''
  const {x, y, width, height} = data

  if (transformOrigin === 'center') {
    result = `${x + width / 2}px ${y + height / 2}px`
  } else if (transformOrigin === 'left') {
    result = `${x}px ${y + height / 2}px`
  } else if (transformOrigin === 'right') {
    result = `${x + width}px ${y + height / 2}px`
  } else if (transformOrigin === 'top') {
    result = `${x + width / 2}px ${y}px`
  } else if (transformOrigin === 'bottom') {
    result = `${x + width / 2}px ${y + height}px`
  } else if (isArray(transformOrigin)) {
    result = `${transformOrigin[0]}px ${transformOrigin[1]}px`
  }

  return result
}
