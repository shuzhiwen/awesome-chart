import {isArray, isString, merge} from 'lodash'
import {Graphics} from 'pixi.js'
import {svgEasing} from '../animation'
import {selector} from '../layers'
import {DrawerData, RectDrawerProps} from '../types'
import {getAttr, isCC, isSC, noChange, splitAlpha} from '../utils'

export function drawRect({
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
  evented,
}: RectDrawerProps) {
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
    evented: getAttr(evented, i, graph.evented),
    source: getAttr(source, i, {}),
  }))
  const mappedData = configuredData.map((datum) => {
    return merge(datum, mapping({...datum, container, theme}))
  })

  if (isSC(container)) {
    container
      .selectAll(`.${className}`)
      .data(mappedData)
      .join('rect')
      .attr('class', (d) => d.className)
      .transition()
      .ease(svgEasing.get(getAttr(transition?.easing, 0, update.easing))!)
      .duration(getAttr(transition?.duration, 0, update.duration))
      .delay(getAttr(transition?.delay, 0, update.delay))
      .attr('x', (d) => d.x)
      .attr('y', (d) => d.y)
      .attr('rx', (d) => d.rx || 0)
      .attr('ry', (d) => d.ry || 0)
      .attr('width', (d) => d.width)
      .attr('height', (d) => d.height)
      .attr('fill', (d) => d.fill)
      .attr('stroke', (d) => d.stroke)
      .attr('stroke-width', (d) => d.strokeWidth)
      .attr('fill-opacity', (d) => d.fillOpacity)
      .attr('stroke-opacity', (d) => d.strokeOpacity)
      .attr('opacity', (d) => d.opacity)
      .attr('transform-origin', (d) => getTransformOrigin(d))
      .attr('pointer-events', (d) => (d.evented ? 'auto' : 'none'))
  }

  if (isCC(container)) {
    container.removeChild(...selector.getChildren(container, className))
    mappedData.forEach((d) => {
      const graphics = new Graphics()
      graphics.data = d
      graphics.alpha = d.opacity
      graphics.className = d.className
      graphics.interactive = d.evented
      graphics.pivot = getTransformPosition(d)
      graphics.position = getTransformPosition(d)
      graphics.cursor = d.evented ? 'pointer' : 'auto'

      isString(d.stroke)
        ? graphics.lineStyle(d.strokeWidth, ...splitAlpha(d.stroke, d.strokeOpacity))
        : graphics.lineTextureStyle({texture: d.stroke, width: d.strokeWidth})
      isString(d.fill)
        ? graphics.beginFill(...splitAlpha(d.fill, d.fillOpacity))
        : graphics.beginTextureFill({texture: d.fill})

      graphics.drawRect(d.x, d.y, d.width, d.height).endFill()
      container.addChild(graphics)
    })
  }
}

const getTransformOrigin = (data: DrawerData<RectDrawerProps>) => {
  const {x, y, width, height, transformOrigin: origin = 'center'} = data

  switch (origin) {
    case 'center':
      return `${x + width / 2}px ${y + height / 2}px`
    case 'left':
      return `${x}px ${y + height / 2}px`
    case 'right':
      return `${x + width}px ${y + height / 2}px`
    case 'top':
      return `${x + width / 2}px ${y}px`
    case 'bottom':
      return `${x + width / 2}px ${y + height}px`
    default:
      return isArray(origin) ? `${origin[0]}px ${origin[1]}px` : ''
  }
}

const getTransformPosition = (data: DrawerData<RectDrawerProps>) => {
  const {x, y, width, height, transformOrigin: origin = 'center'} = data

  switch (origin) {
    case 'center':
      return {x: x + width / 2, y: y + height / 2}
    case 'top':
      return {x: x + width / 2, y: y}
    case 'bottom':
      return {x: x + width / 2, y: y + height}
    case 'left':
      return {x: x, y: y + height / 2}
    case 'right':
      return {x: x + width, y: y + height / 2}
    default:
      return isArray(origin) ? {x: origin[0], y: origin[1]} : {x: 0, y: 0}
  }
}
