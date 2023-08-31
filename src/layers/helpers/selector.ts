import {select} from 'd3'
import {Container} from 'pixi.js'
import {D3Selection, DrawerTarget} from '../../types'
import {isCC, isSC} from '../../utils'

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
  getChildren(target: Container, className: string): Container[]
  getChildren(
    target: DrawerTarget,
    className: string
  ): D3Selection | Container[]
  getChildren(target: Maybe<DrawerTarget>, className: string) {
    if (isSC(target)) {
      return target.selectAll(`.${className}`)
    } else if (isCC(target)) {
      return (target.children as Container[])
        .flatMap((item) =>
          isCC(item) ? this.getChildren(item, className) : item
        )
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
  getDirectChild(target: Container, className: string): Container
  getDirectChild(target: DrawerTarget, className: string): DrawerTarget
  getDirectChild(target: Maybe<DrawerTarget>, className: string) {
    if (isSC(target)) {
      const result = target.selectAll(`.${className}`)
      return result.size() !== 0 ? select(result.node()) : null
    } else if (isCC(target)) {
      return target.children.find((item) => {
        return (item as Container).className === className
      })
    }
  }

  /**
   * Create a subcontainer.
   * @param target
   * Svg container or canvas container.
   * @param className
   * The className of the container.
   */
  createGroup(target: D3Selection, className: string): D3Selection
  createGroup(target: Container, className: string): Container
  createGroup(target: DrawerTarget, className: string): DrawerTarget
  createGroup(target: Maybe<DrawerTarget>, className: string) {
    if (isSC(target)) {
      return target.append('g').attr('class', className)
    } else if (isCC(target)) {
      const group = new Container()
      group.getApp = target.getApp
      group.className = className
      group.eventMode = 'passive'
      target.addChild(group)
      return group
    }
  }

  /**
   * Remove the container from the parent.
   * @param target
   * Svg container or canvas container.
   */
  remove(target: D3Selection): D3Selection
  remove(target: Container): Container
  remove(target: DrawerTarget): DrawerTarget
  remove(target: Maybe<DrawerTarget>) {
    if (isSC(target)) {
      return target.remove()
    } else if (isCC(target)) {
      return target.parent.removeChild(target)
    }
  }
}

/**
 * A collection of methods containing element operations.
 */
export const selector = new Selector()
