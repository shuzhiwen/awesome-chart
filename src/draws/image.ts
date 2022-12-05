import {merge} from 'lodash'
import {fabric} from 'fabric'
import {svgEasing} from '../animation'
import {IImageOptions} from 'fabric/fabric-impl'
import {getAttr, isCC, isSC, noChange, uuid} from '../utils'
import {selector} from '../layers'
import {
  DrawerData,
  DrawerType,
  ElConfig,
  EllipseDrawerProps,
  GraphStyle,
  ImageDrawerProps,
  RectDrawerProps,
  TextDrawerProps,
} from '../types'

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

export function transformToImage<T extends ElConfig>(
  data: T & {
    from: Extract<DrawerType, 'ellipse' | 'rect' | 'text'>
    viewBox?: DrawerData<ImageDrawerProps>['viewBox']
    size?: [number, number]
    offset?: [number, number]
    url?: string
  }
): T {
  if (!data.size || !data.url) {
    return data
  }

  const {from, url, size, viewBox, offset = [0, 0]} = data,
    {container, theme, source, className} = data as typeof data &
      Parameters<NonNullable<GraphStyle['mapping']>>[0],
    position = {x: offset[0], y: offset[1]}

  if (from === 'ellipse') {
    const {cx, cy} = data as unknown as DrawerData<EllipseDrawerProps>
    position.x += cx - size[0] / 2
    position.y += cy - size[1] / 2
  } else if (from === 'rect') {
    const {x, y, width, height} = data as unknown as DrawerData<RectDrawerProps>
    position.x += x + (width - size[0]) / 2
    position.y += y + (height - size[1]) / 2
  } else if (from === 'text') {
    const {x, y, textWidth, textHeight} = data as unknown as DrawerData<TextDrawerProps>
    position.x += x + (textWidth - size[0]) / 2
    position.y += y - (textHeight + size[1]) / 2
  }

  drawImage({
    theme: theme,
    source: [source],
    container: container,
    className: `transformed-image-from-${className}`,
    data: [{url, viewBox, width: size[0], height: size[1], ...position}],
  })

  return data
}
