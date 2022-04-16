import {select} from 'd3'
import {fabric} from 'fabric'
import {Canvas, IGroupOptions} from 'fabric/fabric-impl'
import {DrawerTarget, FabricGroup} from '../../types'
import {createLog, isCanvasContainer, isSvgContainer} from '../../utils'

export class Selector {
  readonly log = createLog(Selector.name)

  readonly engine: Engine

  constructor(engine: Engine) {
    this.engine = engine
    if (engine !== 'svg' && engine !== 'canvas') {
      this.log.error('Wrong engine type')
    }
  }

  setVisible(target: Maybe<DrawerTarget>, visible: boolean) {
    if (this.engine === 'svg' && isSvgContainer(target)) {
      target.attr('display', visible ? 'block' : 'none')
    } else if (this.engine === 'canvas' && isCanvasContainer(target)) {
      target.visible = visible
      target.canvas?.requestRenderAll()
    } else {
      this.log.error('Illegal parameter', {target, visible})
    }
  }

  getChildren(target: Maybe<DrawerTarget>, className: string) {
    if (this.engine === 'svg' && isSvgContainer(target)) {
      return target.selectAll(`.${className}`)
    } else if (this.engine === 'canvas' && isCanvasContainer(target)) {
      return target.getObjects().filter((item) => (item as FabricGroup).className === className)
    }
  }

  getSubcontainer(target: Maybe<DrawerTarget>, className: string): Maybe<DrawerTarget> {
    if (this.engine === 'svg' && isSvgContainer(target)) {
      const result = target.selectAll(`.${className}`)
      return result.size() !== 0 ? select(result.node()) : null
    } else if (this.engine === 'canvas' && isCanvasContainer(target)) {
      return target.getObjects().find((item) => {
        return (item as FabricGroup).className === className
      }) as FabricGroup
    }
  }

  createSubcontainer(
    target: Maybe<DrawerTarget | Canvas>,
    className: string,
    evented = true
  ): Maybe<DrawerTarget> {
    if (this.engine === 'svg' && isSvgContainer(target)) {
      return target.append('g').attr('class', className)
    } else if (this.engine === 'canvas' && isCanvasContainer(target)) {
      const group = new fabric.Group([], {
        className,
        selectable: false,
        subTargetCheck: true,
        evented,
      } as IGroupOptions)
      target.add(group)
      return group
    }
  }

  remove(target: Maybe<DrawerTarget>) {
    if (this.engine === 'svg' && isSvgContainer(target)) {
      return target?.remove()
    } else if (this.engine === 'canvas' && isCanvasContainer(target)) {
      return target.group?.remove(target)
    }
  }
}
