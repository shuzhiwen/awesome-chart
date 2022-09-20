import {svgEasing} from '../animation'
import {fabric} from 'fabric'
import {TextOptions} from 'fabric/fabric-impl'
import {TextDrawerProps} from '../types'
import {selector} from '../layers'
import {merge} from 'lodash'
import {
  mergeAlpha,
  getAttr,
  isSvgCntr,
  isCanvasCntr,
  noChange,
  svgShadowToFabricShadow,
} from '../utils'

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
  source = [],
  data = [],
  transition,
  container,
  className,
  theme,
  evented,
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
    evented: getAttr(evented, i, text.evented),
    rotation: getAttr(rotation, i, 0),
    source: getAttr(source, i, []),
  }))
  const mappedData = configuredData.map((datum) => {
    return merge(datum, mapping({...datum, container, theme}))
  })

  if (isSvgCntr(container)) {
    container
      .selectAll(`.${className}`)
      .data(mappedData)
      .join('text')
      .text((d) => d.value)
      .attr('class', (d) => d.className)
      .transition()
      .ease(svgEasing.get(getAttr(transition?.easing, 0, update.easing))!)
      .duration(getAttr(transition?.duration, 0, update.duration))
      .delay(getAttr(transition?.delay, 0, update.delay))
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
      .attr('transform-origin', (d) => d.transformOrigin)
      .attr('text-decoration', (d) => d.textDecoration)
      .attr('dominant-baseline', 'central')
      .attr('pointer-events', (d) => (d.evented ? 'auto' : 'none'))
      .style('text-shadow', (d) => d.shadow)
      .style('transform', (d) => `rotate(${d.rotation}deg)`)
  }

  if (isCanvasCntr(container)) {
    container.remove(...selector.getChildren(container, className))
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
        shadow: svgShadowToFabricShadow(config.shadow),
        linethrough: config.textDecoration === 'line-through',
        overline: config.textDecoration === 'overline',
        underline: config.textDecoration === 'underline',
        evented: config.evented,
      } as TextOptions)
      text.rotate(config.rotation)
      container.addWithUpdate(text)
    })
  }
}
