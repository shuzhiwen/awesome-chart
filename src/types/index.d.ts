import 'fabric/fabric-impl'
import './constant'
import './global'
import './module'

export * from './animation'
export * from './base'
export * from './core'
export * from './data'
export * from './draw'
export * from './layout'
export * from './options'
export * from './scale'
export * from './styles'
export * from './utils'

declare module 'fabric/fabric-impl' {
  interface Object {
    className?: string
  }
  interface Group {
    className?: string
  }
  interface Gradient {
    id: string
  }
}
