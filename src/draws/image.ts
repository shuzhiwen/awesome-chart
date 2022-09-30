import {svgEasing} from '../animation'
import {fabric} from 'fabric'
import {IImageOptions} from 'fabric/fabric-impl'
import {ImageDrawerProps} from '../types'
import {getAttr, isCC, isSC, noChange, uuid} from '../utils'
import {selector} from '../layers'
import {merge} from 'lodash'

export function drawImage({
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
    opacity: getAttr(opacity, i, graph.opacity),
    evented: getAttr(evented, i, graph.evented),
    source: getAttr(source, i, []),
  }))
  const mappedData = configuredData.map((datum) => {
    return merge(datum, mapping({...datum, container, theme}))
  })

  if (isSC(container)) {
    container
      .selectAll('symbol')
      .data(mappedData)
      .join('symbol')
      .attr('id', (d) => d.id)
      .attr('preserveAspectRatio', 'xMinYMin slice')
      .attr('viewBox', ({viewBox}) =>
        viewBox ? [viewBox.x, viewBox.y, viewBox.width, viewBox.height].join(' ') : null
      )
      .selectAll(`.${className}`)
      .data((d) => [d])
      .join('image')
      .attr('class', (d) => d.className)
      .transition()
      .ease(svgEasing.get(getAttr(transition?.easing, 0, update.easing))!)
      .duration(getAttr(transition?.duration, 0, update.duration))
      .delay(getAttr(transition?.delay, 0, update.delay))
      .attr('opacity', (d) => d.opacity)
      .attr('xlink:href', (d) => d.url)
      .attr('x', (d) => (d.viewBox ? null : d.x))
      .attr('y', (d) => (d.viewBox ? null : d.y))
      .attr('width', (d) => (d.viewBox ? null : d.width))
      .attr('height', (d) => (d.viewBox ? null : d.height))
      .attr('pointer-events', (d) => (d.evented ? 'auto' : 'none'))
    container
      .selectAll('use')
      .data(mappedData)
      .join('use')
      .attr('xlink:href', (d) => `#${d.id}`)
      .attr('x', (d) => (d.viewBox ? d.x : null))
      .attr('y', (d) => (d.viewBox ? d.y : null))
      .attr('width', (d) => (d.viewBox ? d.width : null))
      .attr('height', (d) => (d.viewBox ? d.height : null))
  }

  if (isCC(container)) {
    container.remove(...selector.getChildren(container, className))
    mappedData.forEach((config) => {
      fabric.Image.fromURL(
        config.url,
        (image) => {
          const scaleX = config.width / (config.viewBox?.width ?? image.width!),
            scaleY = config.height / (config.viewBox?.height ?? image.height!),
            minScale = Math.min(scaleX, scaleY)

          image.scaleX = minScale
          image.scaleY = minScale
          container.addWithUpdate(image)
          container.canvas?.requestRenderAll()
        },
        {
          className: config.className,
          left: config.x + config.width / 2,
          top: config.y + config.height / 2,
          opacity: config.opacity,
          source: config.source,
          evented: config.evented,
          ...(config.viewBox
            ? {
                cropX: config.viewBox?.x,
                cropY: config.viewBox?.y,
                width: config.viewBox?.width,
                height: config.viewBox?.height,
              }
            : undefined),
          originX: 'center',
          originY: 'center',
        } as IImageOptions
      )
    })
  }
}
