import {Selection, Transition} from 'd3'
import {Group, IEvent, Object} from 'fabric/fabric-impl'
import {GraphStyleShape, TextStyleShape} from './layer'
import {drawerMapping} from '../draws'

export type DrawerTarget = D3Selection | FabricGroup

export type DrawerDataParameter<T> = T[]

export type DrawerType = keyof typeof drawerMapping

export type DrawerDataShape<T> = T extends BasicDrawerProps<infer U> ? U : T

export type ElEvent = MouseEvent | IEvent<MouseEvent>

export type ElEventType = 'click' | 'mouseover' | 'mouseout' | 'mousemove' | 'mouseup' | 'mousedown'

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

export type D3Selection = Selection<any, unknown, any, unknown>

export type D3Transition = Transition<any, unknown, any, unknown>

export interface FabricObject extends Object {
  className?: string
}

export interface FabricGroup extends Group {
  className?: string
}

export interface ElSourceShape extends AnyObject {
  dimension?: Meta
  category?: Meta
  value?: Meta
}

export interface BasicDrawerProps<T> {
  data: DrawerDataParameter<T>
  source?: DrawerDataParameter<ElSourceShape>
  className: string
  container: DrawerTarget
}

export type ElConfigShape = {
  className: string
  fill: string
  stroke: string
  opacity: number
  fillOpacity: number
  strokeOpacity: number
  strokeWidth: number
  source: MaybeGroup<ElSourceShape>
}

export type TextDrawerProps = TextStyleShape &
  BasicDrawerProps<{
    value: string
    x: number
    y: number
  }>

export type GraphDrawerProps<T> = GraphStyleShape & BasicDrawerProps<T>

export type ArcDrawerProps = GraphDrawerProps<{
  startAngle: number
  endAngle: number
  innerRadius: number
  outerRadius: number
  centerX: number
  centerY: number
}>

export type AreaDrawerProps = GraphDrawerProps<{
  lines: {x: number; y1: number; y2: number}[]
  curve: CurveType
}>

export type CircleDrawerProps = GraphDrawerProps<{
  r: number
  x: number
  y: number
}>

export type CurveDrawerProps = GraphDrawerProps<{
  points: {x: number; y: number}[]
  curve: CurveType
}>

export type EllipseDrawerProps = GraphDrawerProps<{
  rx: number
  ry: number
  cx: number
  cy: number
}>

export type ImageDrawerProps = GraphDrawerProps<{
  url: string
  width: number
  height: number
  x: number
  y: number
}>

export type LineDrawerProps = GraphDrawerProps<{
  x1: number
  y1: number
  x2: number
  y2: number
}>

export type PathDrawerProps = GraphDrawerProps<{
  path: string
  centerX?: number
  centerY?: number
}>

export type PolyDrawerProps = GraphDrawerProps<{
  points: {x: number; y: number}[]
  centerX: number
  centerY: number
}>

export type RectDrawerProps = GraphDrawerProps<{
  width: number
  height: number
  x: number
  y: number
  rx?: number
  ry?: number
}>
