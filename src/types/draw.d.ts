import {Selection} from 'd3'
import {Container, FederatedPointerEvent} from 'pixi.js'
import {DrawerDict} from '../draws'
import {ChartTheme} from './core'
import {GraphStyle, TextStyle} from './styles'

export type DrawerType = Keys<typeof DrawerDict>

export type DrawerTarget = D3Selection | Container

export type DrawerData<Props> = Props extends BasicDrawerProps<infer V> ? V : never

export type D3Selection<GDatum = unknown> = Selection<any, GDatum, any, unknown>

export type ElEvent = MouseEvent | FederatedPointerEvent

export type SourceMeta = Record<'dimension' | 'category' | 'value', Meta>

export type ElSource = {
  meta: AnyObject & Partial<SourceMeta>
  groupIndex: number
  itemIndex: number
}

export type BasicDrawerProps<Datum> = {
  data: Datum[]
  source: ElSource[]
  className: string
  container: DrawerTarget
  theme: ChartTheme
  evented?: boolean
}

export type ElConfig<T extends DrawerType = DrawerType> = {
  className: string
  source: ElSource
  fill?: string
  stroke?: string
  opacity?: number
  fillOpacity?: number
  strokeOpacity?: number
  strokeWidth?: number
} & DrawerDictProps<T>['data'][number]

export type DrawerDictProps<
  T extends DrawerType,
  P extends typeof DrawerDict[T] = typeof DrawerDict[T]
> = Parameters<P>[0]

export type TextDrawerProps = TextStyle &
  BasicDrawerProps<{
    x: number
    y: number
    value: string
    textWidth: number
    textHeight: number
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
  path: string | ((context?: CanvasRenderingContext2D) => string)
  centerX?: number
  centerY?: number
}>

export type PolyDrawerProps = GraphDrawerProps<{
  points: {x: number; y: number}[]
  centerX: number
  centerY: number
}>

export type RectDrawerProps = GraphDrawerProps<{
  x: number
  y: number
  width: number
  height: number
  rx?: number
  ry?: number
  transformOrigin?: Position5
}>
