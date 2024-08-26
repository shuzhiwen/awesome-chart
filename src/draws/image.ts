import {merge} from 'lodash'
import {BaseTexture, Rectangle, Sprite, Texture} from 'pixi.js'
import {svgEasing} from '../anims'
import {selector} from '../layers'
import {ElSource, ImageDrawerProps} from '../types'
import {getAttr, isCC, isSC, noChange, uuid} from '../utils'

export function drawImage({
  rotation,
  opacity,
  mapping = noChange,
  source = [],
  data = [],
  transition,
  container,
  className,
  theme,
  evented,
}: ImageDrawerProps) {
  const {
    graph,
    animation: {update},
  } = theme
  const configuredData = data.map((item, i) => ({
    ...item,
    className,
    id: `${className}-${uuid()}`,
    rotation: getAttr(rotation, i, 0),
    opacity: getAttr(opacity, i, graph.opacity),
    evented: getAttr(evented, i, graph.evented),
    source: getAttr(source, i, {} as ElSource),
  }))
  const mappedData = configuredData.map((datum) =>
    merge(datum, mapping({...datum, container, theme}))
  )

  if (isSC(container)) {
    container
      .selectAll('symbol')
      .data(mappedData)
      .join('symbol')
      .attr('id', (d) => d.id)
      .attr('viewBox', ({viewBox: vb}) =>
        vb ? [vb.x, vb.y, vb.width, vb.height].join(' ') : null
      )
      .selectAll(`.${className}`)
      .data((d) => [d])
      .join('image')
      .attr('class', (d) => d.className)
      .transition()
      .ease(svgEasing.get(getAttr(transition?.easing, 0, update.easing))!)
      .duration(getAttr(transition?.duration, 0, update.duration))
      .delay(getAttr(transition?.delay, 0, update.delay))
      .attr('href', (d) => d.url)
      .attr('opacity', (d) => d.opacity)
      .attr('x', (d) => (d.viewBox ? null : d.x))
      .attr('y', (d) => (d.viewBox ? null : d.y))
      .attr('width', (d) => (d.viewBox ? null : d.width))
      .attr('height', (d) => (d.viewBox ? null : d.height))
      .attr('pointer-events', (d) => (d.evented ? null : 'none'))
      .attr('preserveAspectRatio', 'none')
      .attr('transform', (d) =>
        d.viewBox || !d.rotation ? null : `rotate(${d.rotation})`
      )
      .attr('transform-origin', (d) =>
        d.viewBox ? null : `${d.x + d.width / 2} ${d.y + d.height / 2}`
      )
    container
      .selectAll('use')
      .data(mappedData)
      .join('use')
      .attr('href', (d) => `#${d.id}`)
      .attr('x', (d) => (d.viewBox ? d.x : null))
      .attr('y', (d) => (d.viewBox ? d.y : null))
      .attr('width', (d) => (d.viewBox ? d.width : null))
      .attr('height', (d) => (d.viewBox ? d.height : null))
      .attr('transform', (d) =>
        d.viewBox && d.rotation ? `rotate(${d.rotation})` : null
      )
      .attr('transform-origin', (d) =>
        d.viewBox ? `${d.x + d.width / 2} ${d.y + d.height / 2}` : null
      )
  }

  if (isCC(container)) {
    container.removeChild(...selector.getChildren(container, className))
    mappedData.forEach((d) => {
      const vb = d.viewBox
      const box = vb && new Rectangle(vb.x, vb.y, vb.width, vb.height)
      const sprite = new Sprite(new Texture(BaseTexture.from(d.url), box))

      sprite.width = d.width
      sprite.height = d.height
      sprite.alpha = d.opacity
      sprite.angle = d.rotation
      sprite.anchor.set(0.5, 0.5)
      sprite.x = d.x + d.width / 2
      sprite.y = d.y + d.height / 2
      sprite.className = d.className
      sprite.cursor = d.evented ? 'pointer' : 'auto'
      container.addChild(sprite)
    })
  }
}
