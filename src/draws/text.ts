import {svgEasing} from '../animation'
import {fabric} from 'fabric'
import {TextOptions} from 'fabric/fabric-impl'
import {TextDrawerProps} from '../types'
import {mergeAlpha, getAttr, isSvgContainer, isCanvasContainer, noChange} from '../utils'

export function drawText({
  fontFamily,
  fontSize,
  fontWeight,
  fill,
  stroke,
  strokeWidth,
  opacity,
  fillOpacity,
  strokeOpacity,
  shadow,
  rotation,
  transformOrigin,
  writingMode,
  textDecoration,
  mapping = noChange,
  data = [],
  transition,
  container,
  className,
  theme,
}: TextDrawerProps) {
  const {
    text,
    animation: {update},
  } = theme
  const configuredData = data.map((item, i) => ({
    ...item,
    className,
    fill: getAttr(fill, i, text.fill),
    stroke: getAttr(stroke, i, text.stroke),
    opacity: getAttr(opacity, i, text.opacity),
    fillOpacity: getAttr(fillOpacity, i, text.fillOpacity),
    strokeOpacity: getAttr(strokeOpacity, i, text.strokeOpacity),
    strokeWidth: getAttr(strokeWidth, i, text.strokeWidth),
    shadow: getAttr(shadow, i, text.shadow),
    fontSize: getAttr(fontSize, i, text.fontSize),
    fontFamily: getAttr(fontFamily, i, text.fontFamily),
    fontWeight: getAttr(fontWeight, i, text.fontWeight),
    writingMode: getAttr(writingMode, i, 'horizontal-tb'),
    textDecoration: getAttr(textDecoration, i, 'none'),
    transformOrigin: getAttr(transformOrigin, i, ''),
    rotation: getAttr(rotation, i, 0),
  }))
  const mappedData = configuredData.map((datum) => {
    return mapping(datum as any) as unknown as typeof datum
  })

  if (isSvgContainer(container)) {
    container
      .selectAll(`.${className}`)
      .data(mappedData)
      .join('text')
      .text((d) => d.value)
      .attr('class', (d) => d.className)
      .transition()
      .ease(svgEasing.get(transition?.easing ?? update.easing)!)
      .duration(transition?.duration ?? update.duration)
      .delay(transition?.delay ?? update.delay)
      .attr('x', (d) => d.x)
      .attr('y', (d) => d.y - d.fontSize / 2)
      .attr('fill', (d) => d.fill)
      .attr('stroke', (d) => d.stroke)
      .attr('stroke-width', (d) => d.strokeWidth)
      .attr('opacity', (d) => d.opacity)
      .attr('fill-opacity', (d) => d.fillOpacity)
      .attr('stroke-opacity', (d) => d.strokeOpacity)
      .attr('font-family', (d) => d.fontFamily)
      .attr('font-size', (d) => d.fontSize)
      .attr('font-weight', (d) => d.fontWeight)
      .attr('writing-mode', (d) => d.writingMode)
      .style('text-shadow', (d) => d.shadow)
      .style('text-decoration', (d) => d.textDecoration)
      .style('transform', (d) => `rotate(${d.rotation}deg)`)
      .style('transform-origin', (d) => d.transformOrigin)
      .style('dominant-baseline', 'central')
      .style('pointer-events', 'none')
  }

  if (isCanvasContainer(container)) {
    container.remove(...container.getObjects())
    mappedData.forEach((config) => {
      const text = new fabric.Text(config.value, {
        className: config.className,
        left: config.x,
        top: config.y - config.fontSize,
        fontSize: config.fontSize,
        fontFamily: config.fontFamily,
        fontWeight: config.fontWeight,
        fill: mergeAlpha(config.fill, config.fillOpacity),
        stroke: mergeAlpha(config.stroke, config.strokeOpacity),
        strokeWidth: config.strokeWidth,
        opacity: config.opacity,
        shadow: config.shadow,
        linethrough: config.textDecoration === 'line-through',
        overline: config.textDecoration === 'overline',
        underline: config.textDecoration === 'underline',
      } as TextOptions)
      text.rotate(config.rotation)
      container.addWithUpdate(text)
    })
  }
}
