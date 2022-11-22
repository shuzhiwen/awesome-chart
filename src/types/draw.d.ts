import {Selection} from 'd3'
import {IEvent} from 'fabric/fabric-impl'
import {GraphStyle, TextStyle} from './styles'
import {drawerMapping} from '../draws'
import {ChartTheme} from './core'

export type DrawerType = Keys<typeof drawerMapping>

export type DrawerTarget = D3Selection | fabric.Group

export type DrawerData<Props> = Props extends BasicDrawerProps<infer V> ? V : never

export type D3Selection<GDatum = unknown> = Selection<any, GDatum, any, unknown>

export type ElEvent = MouseEvent | IEvent<MouseEvent>

export type ElSource = AnyObject &
  Partial<{
    groupIndex: number
    itemIndex: number
    dimension: Meta
    category: Meta
    value: Meta
  }>

export type BasicDrawerProps<Datum> = {
  data: Datum[]
  source: (ElSource | ElSource[])[]
  className: string
  container: DrawerTarget
  theme: ChartTheme
  evented?: boolean
}

export type ElConfig = {
  className: string
  source: ElSource | ElSource[]
  fill?: string
  stroke?: string
  opacity?: number
  fillOpacity?: number
  strokeOpacity?: number
  strokeWidth?: number
} & DrawerData<
  | EllipseDrawerProps
  | ImageDrawerProps
  | LineDrawerProps
  | PathDrawerProps
  | PolyDrawerProps
  | RectDrawerProps
  | TextDrawerProps
>

export type TextDrawerProps = TextStyle &
  BasicDrawerProps<{
    value: string
    x: number
    y: number
  }>

export type GraphDrawerProps<Datum> = GraphStyle & BasicDrawerProps<Datum>

export type ArcDrawerProps = GraphDrawerProps<{
  startAngle: number
  endAngle: number
  innerRadius: number
  outerRadius: number
  centerX: number
  centerY: number
  cornerRadius?: number
}>

export type AreaDrawerProps = GraphDrawerProps<{
  lines: {x: number; y1: number; y2: number}[]
  curve: Curve
}>

export type CircleDrawerProps = GraphDrawerProps<{
  r: number
  x: number
  y: number
}>

export type CurveDrawerProps = GraphDrawerProps<{
  points: {x: number; y: number}[]
  curve: Curve
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
  viewBox?: {
    width: number
    height: number
    x: number
    y: number
  }
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
  centerX?: number
  centerY?: number
}>

export type RectDrawerProps = GraphDrawerProps<{
  width: number
  height: number
  x: number
  y: number
  rx?: number
  ry?: number
}>
