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

  getChildren(
    target: Maybe<DrawerTarget>,
    className: string
  ): Maybe<D3Selection | FabricObject[] | FabricGroup[]> {
    if (isSvgCntr(target)) {
      return target.selectAll(`.${className}`)
    } else if (isCanvasCntr(target)) {
      return target
        .getObjects()
        .flatMap((item) => {
          return isCanvasCntr(item)
            ? (this.getChildren(item, className) as FabricGroup[])
            : (item as FabricObject)
        })
        .filter((item) => item.className === className)
    }
  }

  getSubcontainer(target: Maybe<DrawerTarget>, className: string): Maybe<DrawerTarget> {
    if (isSvgCntr(target)) {
      const result = target.selectAll(`.${className}`)
      return result.size() !== 0 ? select(result.node()) : null
    } else if (isCanvasCntr(target)) {
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

  remove(target: Maybe<DrawerTarget>) {
    if (isSvgCntr(target)) {
      return target?.remove()
    } else if (isCanvasCntr(target)) {
      return target.group?.remove(target)
    }
  }
}

export const selector = new Selector()
