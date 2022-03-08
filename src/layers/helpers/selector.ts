import {select} from 'd3'
import {DrawerTarget} from '../../types'
import {createLog, isCanvasContainer, isSvgContainer} from '../../utils'

export class Selector {
  private log = createLog('utils:selector', 'Selector')

  readonly engine: Engine

  constructor(engine: Engine) {
    this.engine = engine
    if (engine !== 'svg' && engine !== 'canvas') {
      this.log.error('wrong engine type')
    }
  }

  setVisible(target: Maybe<DrawerTarget>, visible: boolean) {
    if (this.engine === 'svg' && isSvgContainer(target)) {
      target.attr('display', visible ? 'block' : 'none')
    } else if (this.engine === 'canvas' && isCanvasContainer(target)) {
      this.log.warn('setVisible is not available to canvas selector')
    } else {
      this.log.error('illegal parameter', {target, visible})
    }
  }

  getFirstChildByClassName(target: Maybe<DrawerTarget>, className: string) {
    if (this.engine === 'svg' && isSvgContainer(target)) {
      const result = target.selectAll(`.${className}`)
      return result.size() !== 0 ? select(result.nodes()[0]) : null
    } else {
      return target
    }
  }

  createSubContainer(target: Maybe<DrawerTarget>, className: string) {
    if (this.engine === 'svg' && isSvgContainer(target)) {
      return target.append('g').attr('class', className)
    }
    return target
  }

  remove(target: Maybe<DrawerTarget>) {
    if (this.engine === 'svg' && isSvgContainer(target)) {
      return target?.remove()
    }
    return target
  }
}
