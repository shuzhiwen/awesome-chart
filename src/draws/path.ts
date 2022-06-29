import {fabric} from 'fabric'
import {PathDrawerProps} from '../types'
import {IPathOptions} from 'fabric/fabric-impl'
import {svgEasing} from '../animation'
import {
  mergeAlpha,
  getAttr,
  noChange,
  isCanvasContainer,
  isSvgContainer,
  flatDrawerConfig,
} from '../utils'

export function drawPath({
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
  ...rest
}: PathDrawerProps) {
  const configuredData = data.map((item, i) => ({
    ...flatDrawerConfig(rest, i),
    className,
    path: item.path,
    centerX: item.centerX ?? 0,
    centerY: item.centerY ?? 0,
    fill: getAttr(fill, i, '#fff'),
    stroke: getAttr(stroke, i, '#fff'),
    opacity: getAttr(opacity, i, 1),
    fillOpacity: getAttr(fillOpacity, i, 1),
    strokeOpacity: getAttr(strokeOpacity, i, 1),
    strokeWidth: getAttr(strokeWidth, i, 0),
    source: getAttr(source, i, {}),
    transformOrigin: getAttr(transformOrigin, i, ''),
  }))
  const mappedData = configuredData.map((datum) => {
    return mapping(datum) as typeof datum
  })

  if (isSvgContainer(container)) {
    container
      .selectAll(`.${className}`)
      .data(mappedData)
      .join('path')
      .attr('class', (d) => d.className)
      .transition()
      .duration(transition?.duration ?? 0)
      .delay(transition?.delay ?? 0)
      .ease(svgEasing.get(transition?.easing)!)
      .attr('d', (d) => d.path)
      .attr('fill', (d) => d.fill)
      .attr('stroke', (d) => d.stroke)
      .attr('stroke-width', (d) => d.strokeWidth)
      .attr('opacity', (d) => d.opacity)
      .attr('fill-opacity', (d) => d.fillOpacity)
      .attr('stroke-opacity', (d) => d.strokeOpacity)
      .attr('transform-origin', (d) => d.transformOrigin)
      .attr('transform', (d) => `translate(${d.centerX},${d.centerY})`)
  }

  if (isCanvasContainer(container)) {
    container.remove(...container.getObjects())
    mappedData.forEach((config) => {
      const path = new fabric.Path(config.path, {
        className: config.className,
        fill: mergeAlpha(config.fill, config.fillOpacity),
        stroke: mergeAlpha(config.stroke, config.strokeOpacity),
        strokeWidth: config.strokeWidth,
        opacity: config.opacity,
        source: config.source,
      } as IPathOptions)
      path.left = path.left ? path.left + config.centerX : config.centerX
      path.top = path.top ? path.top + config.centerY : config.centerY
      container.addWithUpdate(path)
    })
  }
}
