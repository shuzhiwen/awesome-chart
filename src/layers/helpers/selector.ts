import {select} from 'd3'
import {fabric} from 'fabric'
import {Canvas, IGroupOptions} from 'fabric/fabric-impl'
import {D3Selection, DrawerTarget, FabricGroup, FabricObject} from '../../types'
import {isCanvasCntr, isSvgCntr} from '../../utils'

class Selector {
  setVisible(target: Maybe<DrawerTarget>, visible: boolean) {
    if (isSvgCntr(target)) {
      target.attr('display', visible ? 'block' : 'none')
    } else if (isCanvasCntr(target)) {
      target.visible = visible
      target.canvas?.requestRenderAll()
    }
  }

  getChildren(target: D3Selection, className: string): D3Selection
  getChildren(target: FabricGroup, className: string): FabricObject[] | FabricGroup[]
  getChildren(target: DrawerTarget, className: string): D3Selection | FabricObject[] | FabricGroup[]
  getChildren(target: Maybe<DrawerTarget>, className: string) {
    if (isSvgCntr(target)) {
      return target.selectAll(`.${className}`)
    } else if (isCanvasCntr(target)) {
      return target
        .getObjects()
        .flatMap((item) =>
          isCanvasCntr(item) ? this.getChildren(item, className) : (item as FabricObject)
        )
        .filter((item) => item.className === className)
    }
  }

  getSubcontainer(target: D3Selection, className: string): D3Selection
  getSubcontainer(target: FabricGroup, className: string): FabricGroup
  getSubcontainer(target: DrawerTarget, className: string): DrawerTarget
  getSubcontainer(target: Maybe<DrawerTarget>, className: string) {
    if (isSvgCntr(target)) {
      const result = target.selectAll(`.${className}`)
      return result.size() !== 0 ? select(result.node()) : null
    } else if (isCanvasCntr(target)) {
      return target.getObjects().find((item) => {
        return (item as FabricGroup).className === className
      })
    }
  }

  createSubcontainer(target: D3Selection, className: string, evented?: boolean): D3Selection
  createSubcontainer(target: FabricGroup, className: string, evented?: boolean): FabricGroup
  createSubcontainer(target: Canvas, className: string, evented?: boolean): FabricGroup
  createSubcontainer(target: DrawerTarget, className: string, evented?: boolean): DrawerTarget
  createSubcontainer(target: Maybe<DrawerTarget | Canvas>, className: string, evented?: boolean) {
    if (isSvgCntr(target)) {
      return target.append('g').attr('class', className)
    } else if (isCanvasCntr(target)) {
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

  remove(target: D3Selection): D3Selection
  remove(target: FabricGroup): FabricGroup
  remove(target: DrawerTarget): DrawerTarget
  remove(target: Maybe<DrawerTarget>) {
    if (isSvgCntr(target)) {
      return target?.remove()
    } else if (isCanvasCntr(target)) {
      return target.group?.remove(target)
    }
  }
}

export const selector = new Selector()
