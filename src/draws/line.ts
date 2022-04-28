import {fabric} from 'fabric'
import {ILineOptions} from 'fabric/fabric-impl'
import {LineDrawerProps} from '../types'
import {isCanvasContainer, isSvgContainer, noChange, mergeAlpha, getAttr} from '../utils'

export function drawLine({
  engine,
  stroke,
  strokeWidth,
  opacity,
  strokeOpacity,
  strokeDasharray,
  mapping = noChange,
  source = [],
  data = [],
  transition,
  container,
  className,
  ...rest
}: LineDrawerProps) {
  const configuredData = data.map((item, i) => ({
    ...rest,
    ...item,
    className,
    stroke: getAttr(stroke, i, '#fff'),
    opacity: getAttr(opacity, i, 1),
    strokeOpacity: getAttr(strokeOpacity, i, 1),
    strokeWidth: getAttr(strokeWidth, i, 1),
    strokeDasharray: getAttr(strokeDasharray, i, ''),
    source: getAttr(source, i, {}),
  }))

  if (engine === 'svg' && isSvgContainer(container)) {
    container
      .selectAll(`.${className}`)
      .data(configuredData.map(mapping) as typeof configuredData)
      .join('line')
      .attr('class', (d) => d.className)
      .style('pointer-events', 'stroke')
      .transition()
      .duration(transition?.duration ?? 0)
      .delay(transition?.delay ?? 0)
      .attr('stroke', (d) => d.stroke)
      .attr('stroke-width', (d) => d.strokeWidth)
      .attr('stroke-dasharray', (d) => d.strokeDasharray)
      .attr('stroke-opacity', (d) => d.strokeOpacity)
      .attr('opacity', (d) => d.opacity)
      .attr('x1', (d) => d.x1)
      .attr('y1', (d) => d.y1)
      .attr('x2', (d) => d.x2)
      .attr('y2', (d) => d.y2)
      .style('pointer-events', 'none')
  }

  if (engine === 'canvas' && isCanvasContainer(container)) {
    container.remove(...container.getObjects())
    configuredData.forEach((config) => {
      const y1 = config.y1 - config.strokeWidth / 2
      const y2 = config.y2 - config.strokeWidth / 2
      const line = new fabric.Line([config.x1, y1, config.x2, y2], {
        className: config.className,
        stroke: mergeAlpha(config.stroke, config.strokeOpacity),
        strokeDashArray: config.strokeDasharray.split(' ').map(Number),
        strokeWidth: config.strokeWidth,
        opacity: config.opacity,
        source: config.source,
      } as ILineOptions)
      container.addWithUpdate(line)
    })
    container.canvas?.requestRenderAll()
  }

  return configuredData
}
