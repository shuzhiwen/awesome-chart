/* eslint-disable @typescript-eslint/no-unused-vars */
import {range} from 'd3'
import {AnimationQueue} from '../animation'
import {drawerMapping} from '../draws'
import {makeClass, selector} from './helpers'
import {cloneDeep, isArray, isEqual, isFunction, merge, noop} from 'lodash'
import {
  commonEvents,
  layerLifeCycles,
  disableEventDrawers,
  tooltipEvents,
  createLog,
  createEvent,
  ungroup,
  isSC,
  isCC,
} from '../utils'
import {
  LayerData,
  CacheLayerData,
  ElConfig,
  DrawBasicProps,
  DrawerTarget,
  ElEvent,
  LayerBaseProps,
  CacheLayerAnimation,
  LayerOptions,
  ChartContext,
  LayerScale,
  CacheLayerEvent,
  LayerStyle,
  LayerAnimation,
} from '../types'

export abstract class LayerBase<Options extends LayerOptions> {
  abstract data: Maybe<LayerData>

  abstract style: Maybe<AnyObject>

  abstract update(...args: unknown[]): void

  abstract draw(): void

  readonly sublayers

  readonly interactive

  readonly className = this.constructor.name

  readonly event = createEvent(this.className)

  readonly options: Options & ChartContext

  readonly cacheData: CacheLayerData<unknown> = {}

  readonly cacheAnimation: CacheLayerAnimation

  protected readonly cacheEvent = {} as CacheLayerEvent

  protected readonly log = createLog(this.className)

  protected needRecalculated = false

  protected root: DrawerTarget

  constructor({options, context, sublayers, interactive}: LayerBaseProps<Options>) {
    this.options = merge(options, context)
    this.sublayers = sublayers || []
    this.interactive = interactive || []
    this.cacheAnimation = {animations: {}, timer: {}, options: {}}
    this.sublayers.forEach((name) => (this.cacheData[name] = {data: []}))
    this.root = selector.createGroup(this.options.root as DrawerTarget, this.className)
    this.createLifeCycles()
    this.createEvent()
    if (isCC(this.root)) {
      this.root.left = this.options.layout.left
      this.root.top = this.options.layout.top
    }
  }

  private createEvent() {
    const {tooltip} = this.options,
      getMouseEvent = (event: ElEvent): MouseEvent =>
        event instanceof MouseEvent ? event : event.e,
      getData = (event: ElEvent, data?: ElConfig): ElConfig =>
        event instanceof MouseEvent ? data : ((event.subTargets?.[0] || event.target) as any)

    merge(this.cacheEvent, {
      'tooltip.mouseout': () => tooltip.hide(),
      'tooltip.mousemove': (event: ElEvent) => tooltip.move(getMouseEvent(event)),
      'tooltip.mouseover': (event: ElEvent, data?: ElConfig) => {
        tooltip.update({data: getData(event, data)})
        tooltip.show(getMouseEvent(event))
      },
    })

    commonEvents.forEach((type) => {
      merge(this.cacheEvent, {
        [`common.${type}`]: Object.fromEntries(
          this.sublayers.map((sublayer) => [
            sublayer,
            (event: ElEvent, data: ElConfig) => {
              this.event.fire(`${type}-${sublayer}`, {
                data: getData(event, data),
                event: getMouseEvent(event),
              })
            },
          ])
        ),
      })
    })
  }

  private createLifeCycles() {
    layerLifeCycles.forEach((name) => {
      const fn: AnyFunction = this[name] || noop

      this[name] = (...parameters: unknown[]) => {
        try {
          if (name === 'draw') {
            this.update()
          } else if (name === 'update' && !this.needRecalculated) {
            this.log.debug.info(`Skip lifeCycle(${name}) call`)
            return
          }

          this.event.fire(`before:${name}`, {...parameters})
          fn.call(this, ...parameters)
          this.event.fire(name, {...parameters})

          if (name === 'setData' || name === 'setScale' || name === 'setStyle') {
            this.needRecalculated = true
          } else if (name === 'update') {
            this.needRecalculated = false
          }
        } catch (error) {
          this.log.error(`🎃 ${name} 🎃 call exception`, error)
          this.options.event.fire('error', {error})
        }
      }
    })
  }

  setData(_: Maybe<LayerData>) {}

  setScale(_: Maybe<LayerScale>) {}

  setStyle(_: Maybe<LayerStyle<AnyObject>>) {}

  setAnimation(config: Maybe<LayerAnimation<CacheLayerAnimation['options']>>) {
    merge(this.cacheAnimation, {
      options: isFunction(config) ? config(this.options.theme) : config,
    })
    this.sublayers.forEach((sublayer) => {
      this.createAnimation(sublayer)
    })
  }

  playAnimation() {
    setTimeout(() => {
      this.sublayers.forEach((type) => this.cacheAnimation.animations[type]?.play())
    })
  }

  setVisible(visible: boolean, sublayer?: string) {
    const className = `${this.className}-${sublayer}`,
      target = sublayer ? selector.getSubcontainer(this.root, className) : this.root
    selector.setVisible(target, visible)
  }

  private bindEvent = (sublayer: string) => {
    if (isSC(this.root)) {
      const els = this.root.selectAll(makeClass(sublayer, true)).style('cursor', 'pointer')

      commonEvents.forEach((type) => {
        els.on(`${type}.common`, null)
        els.on(`${type}.common`, this.cacheEvent[`common.${type}`][sublayer])
      })

      if (this.interactive.includes(sublayer)) {
        tooltipEvents.forEach((type) => {
          els.on(`${type}.tooltip`, null)
          els.on(`${type}.tooltip`, this.cacheEvent[`tooltip.${type}`])
        })
      }
    }

    if (isCC(this.root)) {
      const els = selector.getChildren(this.root, makeClass(sublayer, false))

      commonEvents.forEach((type) => {
        els.forEach((el) => {
          el.off(type)
          el.on(type, this.cacheEvent[`common.${type}`][sublayer])
        })
      })

      if (this.interactive.includes(sublayer)) {
        tooltipEvents.forEach((type) =>
          els.forEach((el) => {
            el.on(type, this.cacheEvent[`tooltip.${type}`])
          })
        )
      }
    }
  }

  private createAnimation = (sublayer: string) => {
    if (this.cacheAnimation.animations[sublayer]) {
      this.cacheAnimation.animations[sublayer]?.destroy()
    }

    const {options} = this.cacheAnimation,
      {animation} = this.options.theme,
      // must await animation to be destroyed
      targets = selector.getChildren(this.root, makeClass(sublayer, false)),
      isFirstPlay = !this.cacheAnimation.animations[sublayer],
      prefix = `${sublayer}-animation-`

    if (
      !options[sublayer] ||
      this.cacheData[sublayer].data.length === 0 ||
      (isSC(targets) ? targets.size() === 0 : targets?.length === 0)
    ) {
      this.cacheAnimation.animations[sublayer] = null
      return
    }

    const animationQueue = new AnimationQueue({options: {loop: false}}),
      enterQueue = new AnimationQueue({options: {loop: false}}),
      loopQueue = new AnimationQueue({options: {loop: true}}),
      {enter, loop, update} = merge({}, animation, options[sublayer]),
      event = animationQueue.event

    animationQueue.pushQueue(enterQueue)
    animationQueue.pushQueue(loopQueue)

    if (isFirstPlay && enter?.type) {
      enterQueue.pushAnimation(enter.type, {...enter, targets}, this.root)
    }

    if (loop?.type) {
      loopQueue.pushAnimation(loop.type, {...loop, targets}, this.root)
    }

    event.on('start', (d: unknown) => this.event.fire(`${prefix}start`, d))
    event.on('process', (d: unknown) => this.event.fire(`${prefix}process`, d))
    event.on('end', (d: unknown) => this.event.fire(`${prefix}end`, d))
    this.cacheAnimation.animations[sublayer] = animationQueue

    if (!isFirstPlay) {
      clearTimeout(this.cacheAnimation.timer[sublayer])
      const {duration, delay} = {...update}
      this.cacheAnimation.timer[sublayer] = setTimeout(
        () => this.cacheAnimation.animations[sublayer]?.play(),
        duration + delay
      )
    }
  }

  protected drawBasic({type, data, sublayer = type}: DrawBasicProps<AnyObject>) {
    if (!this.sublayers.includes(sublayer)) {
      this.log.debug.error('Invalid sublayer type for drawBasic')
      return
    }

    const {theme} = this.options,
      cacheData = this.cacheData[sublayer],
      evented = !disableEventDrawers.has(type),
      sublayerClassName = `${this.className}-${sublayer}`,
      maxGroupLength = Math.max(cacheData.data.length, data.length),
      isFirstDraw = cacheData.data.length === 0,
      sublayerContainer =
        selector.getSubcontainer(this.root, sublayerClassName) ||
        selector.createGroup(this.root, sublayerClassName, evented)

    range(0, maxGroupLength).map((groupIndex) => {
      const groupClassName = `${sublayerClassName}-${groupIndex}`
      const groupContainer = selector.getSubcontainer(sublayerContainer, groupClassName)

      if (groupIndex < data.length && !groupContainer) {
        selector.createGroup(sublayerContainer, groupClassName, evented)
      } else if (groupIndex >= data.length) {
        selector.remove(groupContainer)
      }
    })

    cacheData.data.length = data.length
    data.forEach((groupData, groupIndex) => {
      groupData.source = groupData.data.map((_, itemIndex) => {
        const target = groupData.source?.[itemIndex]
        if (!isArray(target)) return {...target, groupIndex, itemIndex}
        else return target.map((item) => ({...item, groupIndex, itemIndex}))
      })
    })

    if (!cacheData.order) {
      cacheData.order = new Map(
        data
          .filter((item) => ungroup(item.source![0])?.dimension)
          .map((item, i) => [ungroup(item.source![0])?.dimension as Meta, i])
      )
    } else {
      const {order: prevOrder} = cacheData,
        orderedGroupData = new Array(data.length),
        curOrder = data.map((item) => ungroup(item.source![0])?.dimension ?? '')

      curOrder.forEach((dimension, i) => {
        if (prevOrder?.has(dimension)) {
          orderedGroupData[prevOrder.get(dimension)!] = data[i]
        } else {
          orderedGroupData.push(data[i])
        }
      })

      prevOrder.clear()
      data = orderedGroupData.filter(Boolean)
      data.forEach((item, i) => {
        if (ungroup(item.source![0])?.dimension) {
          prevOrder.set(ungroup(item.source![0])?.dimension as Meta, i)
        }
      })
    }

    data.forEach((groupData, i) => {
      if (groupData.hidden || isEqual(cacheData.data[i], groupData)) return

      const groupClassName = `${sublayerClassName}-${i}`
      const groupContainer = selector.getSubcontainer(sublayerContainer, groupClassName)
      const options = {
        ...groupData,
        transition:
          isFirstDraw || groupData.disableUpdateAnimation
            ? {duration: 0, delay: 0}
            : this.cacheAnimation.options[sublayer]?.update,
        className: makeClass(sublayer, false),
        container: groupContainer,
        theme,
      }

      drawerMapping[type](options as any)
      cacheData.data[i] = cloneDeep(groupData as any)
    })

    this.bindEvent(sublayer)
    this.createAnimation(sublayer)
    if (isCC(this.root)) {
      this.root.canvas?.requestRenderAll()
    }
  }

  destroy() {
    this.sublayers.forEach((name) => this.cacheAnimation.animations[name]?.destroy())
    this.root && selector.remove(this.root)
  }
}
