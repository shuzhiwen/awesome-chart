import {svgEasing} from '../animation'
import {fabric} from 'fabric'
import {ILineOptions} from 'fabric/fabric-impl'
import {LineDrawerProps} from '../types'
import {isCanvasContainer, isSvgContainer, noChange, mergeAlpha, getAttr} from '../utils'

export function drawLine({
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
}: LineDrawerProps) {
  const configuredData = data.map((item, i) => ({
    ...item,
    className,
    stroke: getAttr(stroke, i, '#fff'),
    opacity: getAttr(opacity, i, 1),
    strokeOpacity: getAttr(strokeOpacity, i, 1),
    strokeWidth: getAttr(strokeWidth, i, 1),
    strokeDasharray: getAttr(strokeDasharray, i, ''),
    source: getAttr(source, i, null),
  }))
  const mappedData = configuredData.map((datum) => {
    return mapping(datum as any) as unknown as typeof datum
  })

  if (isSvgContainer(container)) {
    container
      .selectAll(`.${className}`)
      .data(mappedData)
      .join('line')
      .attr('class', (d) => d.className)
      .transition()
      .duration(transition?.duration ?? 0)
      .delay(transition?.delay ?? 0)
      .ease(svgEasing.get(transition?.easing)!)
      .attr('x1', (d) => d.x1)
      .attr('y1', (d) => d.y1)
      .attr('x2', (d) => d.x2)
      .attr('y2', (d) => d.y2)
      .attr('stroke', (d) => d.stroke)
      .attr('opacity', (d) => d.opacity)
      .attr('stroke-opacity', (d) => d.strokeOpacity)
      .attr('stroke-width', (d) => d.strokeWidth)
      .attr('stroke-dasharray', (d) => d.strokeDasharray)
      .attr('pointer-events', 'none')
  }

  if (isCanvasContainer(container)) {
    container.remove(...container.getObjects())
    mappedData.forEach((config) => {
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
  }
}
