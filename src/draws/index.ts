import * as Drawer from '.'

export default Drawer
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
  arc: Drawer.drawArc,
  area: Drawer.drawArea,
  circle: Drawer.drawCircle,
  curve: Drawer.drawCurve,
  ellipse: Drawer.drawEllipse,
  image: Drawer.drawImage,
  line: Drawer.drawLine,
  path: Drawer.drawPath,
  polygon: Drawer.drawPolygon,
  rect: Drawer.drawRect,
  text: Drawer.drawText,
}
