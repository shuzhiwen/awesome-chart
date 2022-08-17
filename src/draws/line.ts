import {svgEasing} from '../animation'
import {fabric} from 'fabric'
import {ILineOptions} from 'fabric/fabric-impl'
import {LineDrawerProps} from '../types'
import {isCanvasCntr, isSvgCntr, noChange, mergeAlpha, getAttr} from '../utils'

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
  theme,
}: LineDrawerProps) {
  const {
    graph,
    animation: {update},
  } = theme
  const configuredData = data.map((item, i) => ({
    ...item,
    className,
    stroke: getAttr(stroke, i, graph.stroke),
    opacity: getAttr(opacity, i, graph.opacity),
    strokeOpacity: getAttr(strokeOpacity, i, graph.strokeOpacity),
    strokeWidth: getAttr(strokeWidth, i, graph.strokeWidth),
    strokeDasharray: getAttr(strokeDasharray, i, ''),
    source: getAttr(source, i, null),
  }))
  const mappedData = configuredData.map((datum) => {
    return mapping(datum as any) as unknown as typeof datum
  })

  if (isSvgCntr(container)) {
    container
      .selectAll(`.${className}`)
      .data(mappedData)
      .join('line')
      .attr('class', (d) => d.className)
      .transition()
      .ease(svgEasing.get(getAttr(transition?.easing, 0, update.easing))!)
      .duration(getAttr(transition?.duration, 0, update.duration))
      .delay(getAttr(transition?.delay, 0, update.delay))
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

  if (isCanvasCntr(container)) {
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
