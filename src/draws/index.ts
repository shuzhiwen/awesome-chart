import {
  drawArc,
  drawArea,
  drawCurve,
  drawEllipse,
  drawImage,
  drawLine,
  drawPath,
  drawPolygon,
  drawRect,
  drawText,
} from '.'

export * from './arc'
export * from './area'
export * from './ellipse'
export * from './curve'
export * from './image'
export * from './line'
export * from './path'
export * from './polygon'
export * from './rect'
export * from './text'

export const drawerMapping = {
  arc: drawArc,
  area: drawArea,
  ellipse: drawEllipse,
  curve: drawCurve,
  image: drawImage,
  line: drawLine,
  path: drawPath,
  polygon: drawPolygon,
  rect: drawRect,
  text: drawText,
}
