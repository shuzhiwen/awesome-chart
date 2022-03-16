import * as drawer from '.'
export * from './arc'
export * from './area'
export * from './circle'
export * from './curve'
export * from './ellipse'
export * from './image'
export * from './line'
export * from './path'
export * from './polygon'
export * from './rect'
export * from './text'

export const drawerMapping = {
  arc: drawer.drawArc,
  area: drawer.drawArea,
  circle: drawer.drawCircle,
  curve: drawer.drawCurve,
  ellipse: drawer.drawEllipse,
  image: drawer.drawImage,
  line: drawer.drawLine,
  path: drawer.drawPath,
  polygon: drawer.drawPolygon,
  rect: drawer.drawRect,
  text: drawer.drawText,
}
