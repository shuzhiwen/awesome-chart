import {range} from 'd3'
import {cloneDeep, isEqual, merge, noop} from 'lodash'
import {AnimationQueue} from '../animation'
import {drawerMapping} from '../draws'
import {generateClass, selector} from './helpers'
import {
  commonEvents,
  layerLifeCycles,
  tooltipEvents,
  isSvgCntr,
  isCanvasCntr,
  createLog,
  createEvent,
  disableEventDrawerType,
  ungroup,
} from '../utils'
import {
  BackupDataShape,
  ElConfigShape,
  DataShape,
  DrawBasicProps,
  DrawerTarget,
  ElEvent,
  FabricObject,
  GraphDrawerProps,
  LayerBaseProps,
  BackupAnimationShape,
  BackupAnimationOptions,
  LayerOptions,
  ChartContext,
  LayerScalesShape,
  BackupEventShape,
} from '../types'

export abstract class LayerBase<T extends LayerOptions> {
  abstract data: Maybe<DataShape>

  abstract style: Maybe<UnknownObject>

  abstract setData(data?: Maybe<DataShape>): void

  abstract setScale(scale?: Maybe<LayerScalesShape>): void

  abstract setStyle(style?: Maybe<AnyObject>): void

  abstract update(): void

  abstract draw(): void

  readonly sublayers

  readonly tooltipTargets

  readonly className = this.constructor.name

  readonly event = createEvent(this.className)

  readonly options: T & ChartContext

  readonly backupData: BackupDataShape<AnyObject> = {}

  private readonly backupAnimation: BackupAnimationShape = {timer: {}}

  private readonly backupEvent: BackupEventShape = {common: {}, tooltip: {}}

  protected readonly log = createLog(this.className)

  protected needRecalculated = false

  protected root: DrawerTarget

  constructor({options, context, sublayers, tooltipTargets}: LayerBaseProps<T>) {
    this.options = merge(options, context)
    this.sublayers = sublayers || []
    this.tooltipTargets = tooltipTargets || []
    this.sublayers.forEach((name) => (this.backupData[name] = []))
    this.root = selector.createSubcontainer(this.options.root, this.className)!
    this.backupData = Object.fromEntries(this.sublayers.map((name) => [name, []]))
    this.createLifeCycles()
    this.createEvent()
  }

  private createEvent() {
    const {tooltip} = this.options,
      getMouseEvent = (event: ElEvent): MouseEvent =>
        event instanceof MouseEvent ? event : event.e,
      getData = (event: ElEvent, data?: ElConfigShape): ElConfigShape =>
        event instanceof MouseEvent ? data : ((event.subTargets?.at(0) || event.target) as any)

    this.backupEvent.tooltip = {
      mouseout: () => tooltip.hide(),
      mousemove: (event: ElEvent) => tooltip.move(getMouseEvent(event)),
      mouseover: (event: ElEvent, data?: ElConfigShape) => {
        tooltip.update({data: getData(event, data)})
        tooltip.show(getMouseEvent(event))
      },
    }

    commonEvents.forEach((type) => {
      this.backupEvent.common[type] = Object.fromEntries(
        this.sublayers.map((sublayer) => [
          sublayer,
          (event: ElEvent, data: ElConfigShape) => {
            this.event.fire(`${type}-${sublayer}`, {
              data: getData(event, data),
              event: getMouseEvent(event),
            })
          },
        ])
      )
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
            this.log.debug.warn(`Skip lifeCycle(${name}) call`)
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
          this.log.error(`Layer lifeCycle(${name}) call exception`, error)
        }
      }
    })
  }

  setAnimation(options: BackupAnimationOptions) {
    merge(this.backupAnimation, {options})
    this.sublayers.forEach((sublayer) => this.createAnimation(sublayer))
  }

  playAnimation() {
    this.sublayers.forEach((type) => this.backupAnimation[type]?.play())
  }

  setVisible(visible: boolean, sublayer?: string) {
    const className = `${this.className}-${sublayer}`,
      target = sublayer ? selector.getSubcontainer(this.root, className) : this.root
    selector.setVisible(target, visible)
  }

  private bindEvent = (sublayer: string) => {
    if (isSvgCntr(this.root)) {
      const els = this.root.selectAll(generateClass(sublayer, true)).style('cursor', 'pointer')

      commonEvents.forEach((type) => {
        els.on(`${type}.common`, null)
        els.on(`${type}.common`, this.backupEvent.common[type][sublayer])
      })

      if (this.tooltipTargets.includes(sublayer)) {
        tooltipEvents.forEach((type) => {
          els.on(`${type}.tooltip`, null)
          els.on(`${type}.tooltip`, this.backupEvent.tooltip[type])
        })
      }
    }

    if (isCanvasCntr(this.root)) {
      const els = selector.getChildren(this.root, generateClass(sublayer, false)) as FabricObject[]

      commonEvents.forEach((type) => {
        els.forEach((el) => {
          el.off(type)
          el.on(type, this.backupEvent.common[type][sublayer])
        })
      })

      if (this.tooltipTargets.includes(sublayer)) {
        tooltipEvents.forEach((type) =>
          els.forEach((el) => {
            el.off(type)
            el.on(type, this.backupEvent.tooltip[type])
          })
        )
      }
    }
  }

  private createAnimation = (sublayer: string) => {
    const {options} = this.backupAnimation,
      {animation: theme} = this.options.theme,
      targets = selector.getChildren(this.root, generateClass(sublayer, false)),
      prefix = `${sublayer}-animation-`
    let isFirstPlay = true

    if (this.backupAnimation[sublayer]) {
      this.backupAnimation[sublayer]?.destroy()
      isFirstPlay = false
    }

    if (
      !options ||
      !options[sublayer] ||
      this.backupData[sublayer].length === 0 ||
      (isSvgCntr(targets) ? targets.size() === 0 : targets?.length === 0)
    ) {
      this.backupAnimation[sublayer] = null
      return
    }

    const animationQueue = new AnimationQueue({options: {loop: false}}),
      enterQueue = new AnimationQueue({options: {loop: false}}),
      loopQueue = new AnimationQueue({options: {loop: true}}),
      {enter, loop, update} = options[sublayer],
      event = animationQueue.event

    if (isFirstPlay && enter?.type) {
      enterQueue.pushAnimation(enter.type, {...theme.enter, ...enter, targets}, this.root)
      animationQueue.pushQueue(enterQueue)
    }

    if (loop?.type) {
      loopQueue.pushAnimation(loop.type, {...theme.loop, ...loop, targets}, this.root)
      animationQueue.pushQueue(loopQueue)
    }

    event.on('start', (d: unknown) => this.event.fire(`${prefix}start`, d))
    event.on('process', (d: unknown) => this.event.fire(`${prefix}process`, d))
    event.on('end', (d: unknown) => this.event.fire(`${prefix}end`, d))
    this.backupAnimation[sublayer] = animationQueue

    if (!isFirstPlay) {
      clearTimeout(this.backupAnimation.timer[sublayer])
      const {duration, delay} = {...theme.update, ...update}
      this.backupAnimation.timer[sublayer] = setTimeout(
        () => this.backupAnimation[sublayer]?.play(),
        duration + delay
      )
    }
  }

  protected drawBasic<T>({type, data, sublayer = type, priority}: DrawBasicProps<T>) {
    if (!this.sublayers.includes(sublayer)) {
      this.log.debug.error('Invalid sublayer type for drawBasic')
      return
    }

    const {drawerScheduler, theme} = this.options,
      backupTarget = this.backupData[sublayer],
      evented = !disableEventDrawerType.has(type),
      sublayerClassName = `${this.className}-${sublayer}`,
      maxGroupIndex = Math.max(backupTarget.length, data.length),
      isFirstDraw = backupTarget.length === 0,
      sublayerContainer =
        selector.getSubcontainer(this.root, sublayerClassName) ||
        selector.createSubcontainer(this.root, sublayerClassName, evented),
      afterDraw = () => {
        this.bindEvent(sublayer)
        this.createAnimation(sublayer)
        if (isCanvasCntr(this.root)) {
          this.root.canvas?.requestRenderAll()
        }
      }

    range(0, maxGroupIndex).map((groupIndex) => {
      const groupClassName = `${sublayerClassName}-${groupIndex}`
      const groupContainer = selector.getSubcontainer(sublayerContainer, groupClassName)

      if (groupIndex < data.length && !groupContainer) {
        selector.createSubcontainer(sublayerContainer, groupClassName, evented)
      } else if (groupIndex >= data.length) {
        selector.remove(groupContainer)
      }
    })

    if (!backupTarget.renderOrderCache) {
      backupTarget.renderOrderCache = new Map(
        data
          .filter((item) => ungroup(item.source?.at(0))?.dimension)
          .map((item, i) => [ungroup(item.source?.at(0))?.dimension as Meta, i])
      )
    } else {
      const {renderOrderCache} = backupTarget,
        orderedGroupData = new Array(data.length),
        curRenderOrder = data.map((item) => ungroup(item.source?.at(0))?.dimension ?? '')

      curRenderOrder.forEach((dimension, i) => {
        if (renderOrderCache?.has(dimension)) {
          orderedGroupData[renderOrderCache.get(dimension)!] = data[i]
        } else {
          orderedGroupData.push(data[i])
        }
      })

      renderOrderCache.clear()
      data = orderedGroupData.filter(Boolean)
      data.forEach((item, i) => {
        if (ungroup(item.source?.at(0))?.dimension) {
          renderOrderCache.set(ungroup(item.source?.at(0))?.dimension as Meta, i)
        }
      })
    }

    data.forEach((groupData, i) => {
      if (isEqual(backupTarget[i], groupData)) return

      const groupClassName = `${sublayerClassName}-${i}`
      const groupContainer = selector.getSubcontainer(sublayerContainer, groupClassName)
      const options: GraphDrawerProps<any> = {
        ...(groupData.hidden ? {data: []} : groupData),
        className: generateClass(sublayer, false),
        container: groupContainer!,
        theme,
      }

      if (isFirstDraw) {
        options.transition = {duration: 0, delay: 0}
        drawerScheduler.registerListener(priority ?? 'other', () => drawerMapping[type](options))
      } else {
        options.transition = this.backupAnimation.options?.[sublayer]?.update
        drawerMapping[type](options)
      }

      backupTarget[i] = cloneDeep(groupData)
    })

    if (isFirstDraw) {
      drawerScheduler.event.onWithOff('run', this.options.id + sublayer, afterDraw)
    } else {
      afterDraw()
    }
  }

  destroy() {
    this.sublayers.forEach((name) => this.backupAnimation[name]?.destroy())
    this.root && selector.remove(this.root)
  }
}
