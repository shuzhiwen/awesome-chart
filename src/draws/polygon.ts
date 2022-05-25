import {fabric} from 'fabric'
import {mergeAlpha, getAttr, noChange, isSvgContainer, isCanvasContainer} from '../utils'
import {PolyDrawerProps} from '../types'
import {IPolylineOptions} from 'fabric/fabric-impl'
import {svgEasing} from '../animation'

export function drawPolygon({
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
}: PolyDrawerProps) {
  const configuredData = data.map(({points, centerX, centerY}, i) => ({
    ...rest,
    points,
    className,
    fill: getAttr(fill, i, '#fff'),
    stroke: getAttr(stroke, i, '#fff'),
    opacity: getAttr(opacity, i, 1),
    fillOpacity: getAttr(fillOpacity, i, 1),
    strokeOpacity: getAttr(strokeOpacity, i, 1),
    strokeWidth: getAttr(strokeWidth, i, 0),
    source: getAttr(source, i, {}),
    pointString: points.reduce((prev, cur) => `${prev} ${cur.x},${cur.y}`, ''),
    transformOrigin: `${centerX}px ${centerY}px`,
  }))

  if (isSvgContainer(container)) {
    container
      .selectAll(`.${className}`)
      .data(configuredData.map(mapping) as typeof configuredData)
      .join('polygon')
      .attr('class', (d) => d.className)
      .transition()
      .duration(transition?.duration ?? 0)
      .delay(transition?.delay ?? 0)
      .ease(svgEasing.get(transition?.easing)!)
      .attr('points', (d) => d.pointString)
      .attr('fill', (d) => d.fill)
      .attr('stroke', (d) => d.stroke)
      .attr('stroke-width', (d) => d.strokeWidth)
      .attr('opacity', (d) => d.opacity)
      .attr('fill-opacity', (d) => d.fillOpacity)
      .attr('stroke-opacity', (d) => d.strokeOpacity)
      .attr('transform-origin', (d) => d.transformOrigin)
  }

  if (isCanvasContainer(container)) {
    container.remove(...container.getObjects())
    configuredData.forEach((config) => {
      const polygon = new fabric.Polygon(config.points, {
        className: config.className,
        fill: mergeAlpha(config.fill, config.fillOpacity),
        stroke: mergeAlpha(config.stroke, config.strokeOpacity),
        strokeWidth: config.strokeWidth,
        opacity: config.opacity,
        source: config.source,
      } as IPolylineOptions)
      container.addWithUpdate(polygon)
    })
    container.canvas?.requestRenderAll()
  }

  return configuredData
}
