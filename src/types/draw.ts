import {Selection} from 'd3'
import {Canvas, IEvent, Object} from 'fabric/fabric-impl'
import {GraphStyleShape, TextStyleShape} from '.'
import {drawerMapping} from '../draws'

export type D3Selection = Selection<any, unknown, any, unknown>

export type FabricCanvas = Canvas

export type FabricObject = Object & {
  className: string
}

export type ElEvent = MouseEvent | IEvent<MouseEvent>

export type ElEventType = 'click' | 'mouseover' | 'mouseout' | 'mousemove' | 'mouseup' | 'mousedown'

export type DrawerTarget = D3Selection | FabricCanvas

export type DrawerDataParameter<T> = T[]

export type DrawerType = keyof typeof drawerMapping

export type BasicElConfigShape = {
  // visual
  fill: string
  stroke: string
  strokeWidth: number
  opacity: number
  fillOpacity: number
  strokeOpacity: number
  // data
  source: AnyObject
  // layout
  className: string
}

export interface BasicDrawerProps<T> {
  // basic
  engine: Engine
  // data
  data: DrawerDataParameter<T>
  source?: DrawerDataParameter<AnyObject>
  // layout
  className: string
  container: DrawerTarget
}

export interface GraphDrawerProps<T> extends GraphStyleShape, BasicDrawerProps<T> {}

export interface TextDrawerProps
  extends TextStyleShape,
    BasicDrawerProps<{
      value: string
      x: number
      y: number
    }> {}
