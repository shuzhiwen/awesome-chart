import {select} from 'd3'
import {fabric} from 'fabric'
import {Canvas, IGroupOptions} from 'fabric/fabric-impl'
import {D3Selection, DrawerTarget, FabricGroup, FabricObject} from '../../types'
import {createLog, isCanvasContainer, isSvgContainer} from '../../utils'

class Selector {
  readonly log = createLog(Selector.name)

  setVisible(target: Maybe<DrawerTarget>, visible: boolean) {
    if (isSvgContainer(target)) {
      target.attr('display', visible ? 'block' : 'none')
    } else if (isCanvasContainer(target)) {
      target.visible = visible
      target.canvas?.requestRenderAll()
    } else {
      this.log.error('Illegal parameter', {target, visible})
    }
  }

  getChildren(
    target: Maybe<DrawerTarget>,
    className: string
  ): Maybe<D3Selection | FabricObject[] | FabricGroup[]> {
    if (isSvgContainer(target)) {
      return target.selectAll(`.${className}`)
    } else if (isCanvasContainer(target)) {
      return target
        .getObjects()
        .flatMap((item) => {
          return isCanvasContainer(item)
            ? (this.getChildren(item, className) as FabricGroup[])
            : (item as FabricObject)
        })
        .filter((item) => item.className === className)
    }
  }

  getSubcontainer(target: Maybe<DrawerTarget>, className: string): Maybe<DrawerTarget> {
    if (isSvgContainer(target)) {
      const result = target.selectAll(`.${className}`)
      return result.size() !== 0 ? select(result.node()) : null
    } else if (isCanvasContainer(target)) {
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
    if (isSvgContainer(target)) {
      return target.append('g').attr('class', className)
    } else if (isCanvasContainer(target)) {
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
    if (isSvgContainer(target)) {
      return target?.remove()
    } else if (isCanvasContainer(target)) {
      return target.group?.remove(target)
    }
  }
}

export const selector = new Selector()
