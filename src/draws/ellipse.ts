import {svgEasing} from '../animation'
import {fabric} from 'fabric'
import {IEllipseOptions} from 'fabric/fabric-impl'
import {EllipseDrawerProps} from '../types'
import {mergeAlpha, getAttr, noChange, isSvgContainer, isCanvasContainer} from '../utils'

export function drawEllipse({
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
}: EllipseDrawerProps) {
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
    transformOrigin: getAttr(transformOrigin, i, `${item.cx} ${item.cy}`),
    source: getAttr(source, i, null),
  }))
  const mappedData = configuredData.map((datum) => {
    return mapping(datum) as typeof datum
  })

  if (isSvgContainer(container)) {
    container
      .selectAll(`.${className}`)
      .data(mappedData)
      .join('ellipse')
      .attr('class', (d) => d.className)
      .transition()
      .ease(svgEasing.get(getAttr(transition?.easing, 0, update.easing))!)
      .duration(getAttr(transition?.duration, 0, update.duration))
      .delay(getAttr(transition?.delay, 0, update.delay))
      .attr('stroke', (d) => d.stroke)
      .attr('stroke-width', (d) => d.strokeWidth)
      .attr('cx', (d) => d.cx)
      .attr('cy', (d) => d.cy)
      .attr('rx', (d) => d.rx)
      .attr('ry', (d) => d.ry)
      .attr('fill', (d) => d.fill)
      .attr('opacity', (d) => d.opacity)
      .attr('fill-opacity', (d) => d.fillOpacity)
      .attr('stroke-opacity', (d) => d.strokeOpacity)
      .attr('transform-origin', (d) => d.transformOrigin)
  }

  if (isCanvasContainer(container)) {
    container.remove(...container.getObjects())
    mappedData.forEach((config) => {
      const ellipse = new fabric.Ellipse({
        className: config.className,
        rx: config.rx,
        ry: config.ry,
        left: config.cx - config.rx,
        top: config.cy - config.ry,
        fill: mergeAlpha(config.fill, config.fillOpacity),
        stroke: mergeAlpha(config.stroke, config.strokeOpacity),
        strokeWidth: config.strokeWidth,
        opacity: config.opacity,
        source: config.source,
      } as IEllipseOptions)
      container.addWithUpdate(ellipse)
    })
  }
}
