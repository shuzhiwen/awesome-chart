import {merge} from 'lodash'
import {Graphics} from 'pixi.js'
import {svgEasing} from '../animation'
import {isCC, isSC, noChange, getAttr, splitAlpha} from '../utils'
import {LineDrawerProps} from '../types'
import {selector} from '../layers'

export function drawLine({
  rotation,
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
  evented,
}: LineDrawerProps) {
  const {
    graph,
    animation: {update},
  } = theme
  const configuredData = data.map((item, i) => ({
    ...item,
    className,
    rotation: getAttr(rotation, i, 0),
    stroke: getAttr(stroke, i, graph.stroke),
    opacity: getAttr(opacity, i, graph.opacity),
    strokeOpacity: getAttr(strokeOpacity, i, graph.strokeOpacity),
    strokeWidth: getAttr(strokeWidth, i, graph.strokeWidth),
    strokeDasharray: getAttr(strokeDasharray, i, ''),
    evented: getAttr(evented, i, graph.evented),
    source: getAttr(source, i, []),
  }))
  const mappedData = configuredData.map((datum) => {
    return merge(datum, mapping({...datum, container, theme}))
  })

  if (isSC(container)) {
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
      .attr('transform-origin', (d) => `${d.x1} ${d.y1}`)
      .attr('transform', (d) => `rotate(${d.rotation})`)
      .attr('pointer-events', (d) => (d.evented ? 'auto' : 'none'))
  }

  if (isCC(container)) {
    container.removeChild(...selector.getChildren(container, className))
    mappedData.forEach((d) => {
      const graphics = new Graphics(),
        {x1, x2, y1, y2, rotation} = d,
        theta =
          (rotation / 180) * Math.PI -
          Math.atan((y1 - y2) / (x2 - x1)) +
          (Math.PI / 2) * (x2 > x1 ? 1 : -1),
        length = Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2),
        _x2 = rotation === 0 ? x2 : x1 + Math.sin(theta) * length,
        _y2 = rotation === 0 ? y2 : y1 - Math.cos(theta) * length

      graphics.data = d
      graphics.alpha = d.opacity
      graphics.className = d.className
      graphics.interactive = d.evented
      graphics.cursor = d.evented ? 'pointer' : 'auto'
      graphics
        .moveTo(x1, y1)
        .lineStyle(d.strokeWidth, ...splitAlpha(d.stroke, d.strokeOpacity))
        .dashLineTo(_x2, _y2, d.strokeDasharray)
      container.addChild(graphics)
    })
  }
}
