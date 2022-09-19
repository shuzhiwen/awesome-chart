import 'fabric/fabric-impl'
import './global'
import './module'

export * from './animation'
export * from './core'
export * from './data'
export * from './draw'
export * from './layer'
export * from './layout'
export * from './scale'
export * from './utils'

declare module 'fabric/fabric-impl' {
  interface Object {
    className?: string
  }
  interface Group {
    className?: string
  }
}
