import {fabric} from 'fabric'
import {PolyDrawerProps} from '../types'
import {IPolylineOptions} from 'fabric/fabric-impl'
import {svgEasing} from '../animation'
import {mergeAlpha, getAttr, noChange, isSvgContainer, isCanvasContainer} from '../utils'

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
  theme,
}: PolyDrawerProps) {
  const {
    graph,
    animation: {update},
  } = theme
  const configuredData = data.map(({points, centerX, centerY}, i) => ({
    points,
    className,
    fill: getAttr(fill, i, graph.fill),
    stroke: getAttr(stroke, i, graph.stroke),
    opacity: getAttr(opacity, i, graph.opacity),
    fillOpacity: getAttr(fillOpacity, i, graph.fillOpacity),
    strokeOpacity: getAttr(strokeOpacity, i, graph.strokeOpacity),
    strokeWidth: getAttr(strokeWidth, i, graph.strokeWidth),
    pointString: points.reduce((prev, cur) => `${prev} ${cur.x},${cur.y}`, ''),
    transformOrigin: `${centerX}px ${centerY}px`,
    source: getAttr(source, i, null),
  }))
  const mappedData = configuredData.map((datum) => {
    return mapping(datum) as typeof datum
  })

  if (isSvgContainer(container)) {
    container
      .selectAll(`.${className}`)
      .data(mappedData)
      .join('polygon')
      .attr('class', (d) => d.className)
      .transition()
      .ease(svgEasing.get(getAttr(transition?.easing, 0, update.easing))!)
      .duration(getAttr(transition?.duration, 0, update.duration))
      .delay(getAttr(transition?.delay, 0, update.delay))
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
    mappedData.forEach((config) => {
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
  }
}
