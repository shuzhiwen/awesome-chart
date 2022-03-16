import {Selection, Transition} from 'd3'
import {Canvas, IEvent, Object} from 'fabric/fabric-impl'
import {GraphStyleShape, TextStyleShape, Meta} from '.'
import {
  drawArc,
  drawArea,
  drawCircle,
  drawCurve,
  drawEllipse,
  drawerMapping,
  drawImage,
  drawLine,
  drawPath,
  drawPolygon,
  drawRect,
  drawText,
} from '../draws'

export type D3Selection = Selection<any, unknown, any, unknown>

export type D3Transition = Transition<any, unknown, any, unknown>

export type FabricCanvas = Canvas

export type FabricObject = Object & {
  className: string
}

export type DrawerTarget = D3Selection | FabricCanvas

export type DrawerDataParameter<T> = T[]

export type DrawerType = keyof typeof drawerMapping

export type DrawerDataShape<T> = T extends BasicDrawerProps<infer U> ? U : T

export type ElEvent = MouseEvent | IEvent<MouseEvent>

export type ElEventType = 'click' | 'mouseover' | 'mouseout' | 'mousemove' | 'mouseup' | 'mousedown'

export type ElConfigShape = ArrayItem<
  ReturnType<
    | typeof drawArc
    | typeof drawArea
    | typeof drawCircle
    | typeof drawCurve
    | typeof drawEllipse
    | typeof drawImage
    | typeof drawLine
    | typeof drawPath
    | typeof drawPolygon
    | typeof drawRect
    | typeof drawText
  >
>

export type ElSourceShape = {
  dimension?: Meta
  category?: Meta
  value?: Meta
}

export type CurveType =
  | 'curveLinear'
  | 'curveNatural'
  | 'curveBumpX'
  | 'curveBumpY'
  | 'curveMonotoneX'
  | 'curveMonotoneY'
  | 'curveStep'
  | 'curveStepAfter'
  | 'curveStepBefore'

export interface BasicDrawerProps<T> {
  engine: Engine
  data: DrawerDataParameter<T>
  source?: DrawerDataParameter<ElSourceShape>
  className: string
  container: DrawerTarget
}

export interface GraphDrawerProps<T> extends GraphStyleShape, BasicDrawerProps<T> {
  hide?: boolean
}

export interface ArcDrawerProps
  extends GraphDrawerProps<{
    startAngle: number
    endAngle: number
    innerRadius: number
    outerRadius: number
    centerX: number
    centerY: number
  }> {}

export interface AreaDrawerProps
  extends GraphDrawerProps<{
    lines: {x: number; y1: number; y2: number}[]
    curve: CurveType
  }> {}

export interface CircleDrawerProps
  extends GraphDrawerProps<{
    r: number
    cx: number
    cy: number
  }> {}

export interface CurveDrawerProps
  extends GraphDrawerProps<{
    points: {x: number; y: number}[]
    curve: CurveType
  }> {}

export interface EllipseDrawerProps
  extends GraphDrawerProps<{
    rx: number
    ry: number
    cx: number
    cy: number
  }> {}

export interface ImageDrawerProps
  extends GraphDrawerProps<{
    url: string
    width: number
    height: number
    x: number
    y: number
  }> {}

export interface LineDrawerProps
  extends GraphDrawerProps<{
    x1: number
    y1: number
    x2: number
    y2: number
  }> {}

export interface PathDrawerProps
  extends GraphDrawerProps<{
    path: string
    centerX: number
    centerY: number
  }> {}

export interface PolyDrawerProps
  extends GraphDrawerProps<{
    points: {x: number; y: number}[]
    centerX: number
    centerY: number
  }> {}

export interface RectDrawerProps
  extends GraphDrawerProps<{
    width: number
    height: number
    x: number
    y: number
    rx?: number
    ry?: number
  }> {}

export interface TextDrawerProps
  extends TextStyleShape,
    BasicDrawerProps<{
      value: string
      x: number
      y: number
    }> {}
