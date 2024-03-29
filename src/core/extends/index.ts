import {Application} from 'pixi.js'
import {ElConfig} from '../../types'
import './dashLineTo'
import './drawPath'

declare module 'pixi.js' {
  interface Graphics {
    drawPath(d: string): Graphics
    dashLineTo(x: number, y: number, dasharray: string): Graphics
    className?: string
  }
  interface Container {
    getApp?(): Application
    className?: string
    data?: ElConfig
  }
  interface Texture {
    gradientId?: string
  }
}
