import {drawImage} from '../../draws'
import {
  DrawerData,
  DrawerType,
  ElConfig,
  EllipseDrawerProps,
  GraphStyle,
  ImageDrawerProps,
  LineDrawerProps,
  RectDrawerProps,
  TextDrawerProps,
} from '../../types'

export function attachImageToElement(
  props: ElConfig &
    Pick<DrawerData<ImageDrawerProps>, 'url' | 'viewBox'> & {
      from: Extract<DrawerType, 'ellipse' | 'rect' | 'text' | 'line'>
      // for line and path
      position?: Extract<Alignment, 'start' | 'end'>
      offset?: Vec2
      size?: Vec2
    }
) {
  const {from, url, viewBox, position, offset, size, ...config} =
      props as typeof props & Parameters<NonNullable<GraphStyle['mapping']>>[0],
    [width, height] = size ?? [0, 0]
  let [x, y] = offset ?? [0, 0]

  if (from === 'ellipse') {
    const d = props as DrawerData<EllipseDrawerProps>
    x += d.cx - width / 2
    y += d.cy - height / 2
  } else if (from === 'rect') {
    const d = props as DrawerData<RectDrawerProps>
    x += d.x + (d.width - width) / 2
    y += d.y + (d.height - height) / 2
  } else if (from === 'text') {
    const d = props as DrawerData<TextDrawerProps>
    x += d.x + (d.textWidth - width) / 2
    y += d.y - (d.textHeight + height) / 2
  } else if (from === 'line') {
    const d = props as DrawerData<LineDrawerProps>
    x += (position === 'start' ? d.x1 : d.x2) - width / 2
    y += (position === 'end' ? d.y1 : d.y2) - height / 2
  }

  drawImage({
    ...config,
    source: [config.source],
    className: `transformed-image-from-${config.className}`,
    data: [{url, viewBox, width, height, x, y}],
  })
}
