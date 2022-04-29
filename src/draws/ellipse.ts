import {svgEasing} from '../animation'
import {fabric} from 'fabric'
import {IEllipseOptions} from 'fabric/fabric-impl'
import {EllipseDrawerProps} from '../types'
import {mergeAlpha, getAttr, noChange, isSvgContainer, isCanvasContainer} from '../utils'

export function drawEllipse({
  engine,
  fill,
  stroke,
  strokeWidth,
  opacity,
  fillOpacity,
  strokeOpacity,
  mapping = noChange,
  source = [],
  data = [],
  transition,
  container,
  className,
  ...rest
}: EllipseDrawerProps) {
  const configuredData = data.map((item, i) => ({
    ...rest,
    ...item,
    className,
    fill: getAttr(fill, i, '#fff'),
    stroke: getAttr(stroke, i, '#fff'),
    opacity: getAttr(opacity, i, 1),
    fillOpacity: getAttr(fillOpacity, i, 1),
    strokeOpacity: getAttr(strokeOpacity, i, 1),
    strokeWidth: getAttr(strokeWidth, i, 0),
    source: getAttr(source, i, {}),
  }))

  if (engine === 'svg' && isSvgContainer(container)) {
    container
      .selectAll(`.${className}`)
      .data(configuredData.map(mapping) as typeof configuredData)
      .join('ellipse')
      .attr('class', (d) => d.className)
      .transition()
      .duration(transition?.duration ?? 0)
      .delay(transition?.delay ?? 0)
      .ease(svgEasing.get(transition?.easing)!)
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
      .style('transform-origin', (d) => `${d.cx}px ${d.cy}px`)
  }

  if (engine === 'canvas' && isCanvasContainer(container)) {
    container.remove(...container.getObjects())
    configuredData.forEach((config) => {
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
    container.canvas?.requestRenderAll()
  }

  return configuredData
}
