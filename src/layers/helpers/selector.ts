import {select} from 'd3'
import {fabric} from 'fabric'
import {Canvas, Group, IGroupOptions} from 'fabric/fabric-impl'
import {D3Selection, DrawerTarget} from '../../types'
import {isCC, isSC} from '../../utils'

type FObject = fabric.Object

class Selector {
  /**
   * Hide/Show all elements under selector.
   * @param target
   * Svg container or canvas container.
   * @param visible
   * Set the element to be visible or invisible.
   */
  setVisible(target: Maybe<DrawerTarget>, visible: boolean) {
    if (isSC(target)) {
      target.attr('opacity', visible ? 1 : 0)
    } else if (isCC(target)) {
      target.visible = visible
      target.canvas?.requestRenderAll()
    }
  }

  /**
   * Recursively find elements matching `className`.
   * @param target
   * Svg container or canvas container.
   * @param className
   * The className of the element.
   */
  getChildren(target: D3Selection, className: string): D3Selection
  getChildren(target: Group, className: string): FObject[] | Group[]
  getChildren(target: DrawerTarget, className: string): D3Selection | FObject[] | Group[]
  getChildren(target: Maybe<DrawerTarget>, className: string) {
    if (isSC(target)) {
      return target.selectAll(`.${className}`)
    } else if (isCC(target)) {
      return target
        .getObjects()
        .flatMap((item) => (isCC(item) ? this.getChildren(item, className) : item))
        .filter((item) => item.className === className)
    }
  }

  /**
   * Find whether there is a subcontainer in the direct children.
   * @param target
   * Svg container or canvas container.
   * @param className
   * The className of the container.
   */
  getDirectChild(target: D3Selection, className: string): D3Selection
  getDirectChild(target: Group, className: string): Group
  getDirectChild(target: DrawerTarget, className: string): DrawerTarget
  getDirectChild(target: Maybe<DrawerTarget>, className: string) {
    if (isSC(target)) {
      const result = target.selectAll(`.${className}`)
      return result.size() !== 0 ? select(result.node()) : null
    } else if (isCC(target)) {
      return target.getObjects().find((item) => {
        return item.className === className
      })
    }
  }

  /**
   * Create a subcontainer.
   * @param target
   * Svg container or canvas container.
   * @param className
   * The className of the container.
   * @param evented
   * Whether the container responds to interaction events.
   */
  createGroup(target: D3Selection, className: string, evented?: boolean): D3Selection
  createGroup(target: Group, className: string, evented?: boolean): Group
  createGroup(target: Canvas, className: string, evented?: boolean): Group
  createGroup(target: DrawerTarget, className: string, evented?: boolean): DrawerTarget
  createGroup(target: Maybe<DrawerTarget | Canvas>, className: string, evented = true) {
    if (isSC(target)) {
      return target.append('g').attr('class', className)
    } else if (isCC(target)) {
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

  /**
   * Remove the container from the parent.
   * @param target
   * Svg container or canvas container.
   */
  remove(target: D3Selection): D3Selection
  remove(target: Group): Group
  remove(target: DrawerTarget): DrawerTarget
  remove(target: Maybe<DrawerTarget>) {
    if (isSC(target)) {
      return target?.remove()
    } else if (isCC(target)) {
      return target.group?.remove(target)
    }
  }
}

/**
 * A collection of methods containing element operations.
 */
export const selector = new Selector()
