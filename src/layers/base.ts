import {cloneDeep, isEqual, merge, noop} from 'lodash'
import {AnimationQueue} from '../animation'
import {drawerMapping} from '../draws'
import {selector} from './helpers'
import {
  commonEvents,
  layerLifeCycles,
  tooltipEvents,
  isSvgContainer,
  isCanvasContainer,
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

  private backupAnimation: BackupAnimationShape = {timer: {}}

  private backupEvent: AnyObject = {}

  protected root: DrawerTarget

  protected needRecalculated = false

  protected log = createLog(this.className)

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

    this.backupEvent = {
      common: {},
      tooltip: {
        mouseout: () => tooltip.hide(),
        mousemove: (event: ElEvent) => tooltip.move(getMouseEvent(event)),
        mouseover: (event: ElEvent, data?: ElConfigShape) => {
          tooltip.update({data: getData(event, data)})
          tooltip.show(getMouseEvent(event))
        },
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

      this[name] = (...parameters: any) => {
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
    if (isSvgContainer(this.root)) {
      const els = this.root.selectAll(`.chart-basic-${sublayer}`).style('cursor', 'pointer')

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

    if (isCanvasContainer(this.root)) {
      const els = selector.getChildren(this.root, `.chart-basic-${sublayer}`) as FabricObject[]

      commonEvents.forEach((type) => {
        els?.forEach((el) => {
          el.off(type)
          el.on(type, this.backupEvent.common[type][sublayer])
        })
      })

      if (this.tooltipTargets.includes(sublayer)) {
        tooltipEvents.forEach((type) =>
          els?.forEach((el) => {
            el.off(type)
            el.on(type, this.backupEvent.tooltip[type])
          })
        )
      }
    }
  }

  private createAnimation = (sublayer: string) => {
    const {options} = this.backupAnimation,
      targets = selector.getChildren(this.root, `chart-basic-${sublayer}`),
      prefix = `${sublayer}-animation-`
    let isFirstPlay = true

    if (this.backupAnimation[sublayer]) {
      this.backupAnimation[sublayer]?.destroy()
      isFirstPlay = false
    }

    if (this.backupData[sublayer].length === 0 || !options || !options[sublayer]) {
      this.backupAnimation[sublayer] = null
      return
    }

    const animationQueue = new AnimationQueue({options: {loop: false}}),
      enterQueue = new AnimationQueue({options: {loop: false}}),
      loopQueue = new AnimationQueue({options: {loop: true}}),
      {enter, loop, update} = options[sublayer],
      event = animationQueue.event

    if (isFirstPlay && enter?.type) {
      enterQueue.pushAnimation(enter.type, {...enter, targets}, this.root)
      animationQueue.pushQueue(enterQueue)
    }

    if (loop?.type) {
      loopQueue.pushAnimation(loop.type, {...loop, targets}, this.root)
      animationQueue.pushQueue(loopQueue)
    }

    event.on('start', (d: any) => this.event.fire(`${prefix}start`, d))
    event.on('process', (d: any) => this.event.fire(`${prefix}process`, d))
    event.on('end', (d: any) => this.event.fire(`${prefix}end`, d))
    this.backupAnimation[sublayer] = animationQueue

    if (!isFirstPlay) {
      clearTimeout(this.backupAnimation.timer[sublayer])
      const {duration = 2000, delay = 0} = update || {}
      this.backupAnimation.timer[sublayer] = setTimeout(
        () => this.backupAnimation[sublayer]?.play(),
        duration + delay
      )
    }
  }

  protected drawBasic<T>({type, data, sublayer = type}: DrawBasicProps<T>) {
    if (!this.sublayers.includes(sublayer)) {
      this.log.debug.error('Invalid sublayer type for drawBasic')
      return
    }

    const backupTarget = this.backupData[sublayer],
      evented = !disableEventDrawerType.has(type),
      sublayerClassName = `${this.className}-${sublayer}`,
      sublayerContainer =
        selector.getSubcontainer(this.root, sublayerClassName) ||
        selector.createSubcontainer(this.root, sublayerClassName, evented)

    // delete redundant groups in the last rendering
    for (let i = 0; i < Math.max(backupTarget.length, data.length); i++) {
      const groupClassName = `${sublayerClassName}-${i}`
      const groupContainer = selector.getSubcontainer(sublayerContainer, groupClassName)

      if (i < data.length && !groupContainer) {
        selector.createSubcontainer(sublayerContainer, groupClassName, evented)
      } else if (i >= data.length) {
        selector.remove(groupContainer)
      }
    }

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

    backupTarget.length = data.length
    data.forEach((groupData, i) => {
      if (isEqual(backupTarget[i], groupData)) return

      const groupClassName = `${sublayerClassName}-${i}`,
        groupContainer = selector.getSubcontainer(sublayerContainer, groupClassName),
        options: GraphDrawerProps<any> = {
          ...(groupData.hidden ? {data: []} : groupData),
          className: `chart-basic-${sublayer}`,
          container: groupContainer!,
        }

      if (backupTarget[i]) {
        options.transition = this.backupAnimation.options?.[sublayer]?.update
      }

      drawerMapping[type](options)
      backupTarget[i] = cloneDeep(groupData)
    })

    if (isCanvasContainer(this.root)) {
      this.root.canvas?.requestRenderAll()
    }

    this.bindEvent(sublayer)
    this.createAnimation(sublayer)
  }

  destroy() {
    this.sublayers.forEach((name) => this.backupAnimation[name]?.destroy())
    this.root && selector.remove(this.root)
  }
}
