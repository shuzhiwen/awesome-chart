import {select} from 'd3'
import {DrawerTarget, FabricObject} from '../../types'
import {createLog, isCanvasContainer, isSvgContainer} from '../../utils'

export class Selector {
  readonly log = createLog(Selector.name)

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

  getChildren(target: Maybe<DrawerTarget>, className: string) {
    if (this.engine === 'svg' && isSvgContainer(target)) {
      return target.selectAll(`.${className}`)
    } else if (this.engine === 'canvas' && isCanvasContainer(target)) {
      return target.getObjects().filter((item) => (item as FabricObject).className === className)
    }
  }

  getSubcontainer(target: Maybe<DrawerTarget>, className: string) {
    if (this.engine === 'svg' && isSvgContainer(target)) {
      const result = target.selectAll(`.${className}`)
      return result.size() !== 0 ? select(result.nodes()[0]) : null
    } else {
      return target
    }
  }

  createSubcontainer(target: Maybe<DrawerTarget>, className: string) {
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
