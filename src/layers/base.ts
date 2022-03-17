import {isEqual, merge, noop} from 'lodash'
import {AnimationQueue} from '../animation'
import {drawerMapping} from '../draws'
import {Selector} from './helpers'
import {
  COMMON_EVENTS,
  LAYER_LIFE_CYCLES,
  TOOLTIP_EVENTS,
  isSvgContainer,
  isCanvasContainer,
  createLog,
  createEvent,
} from '../utils'
import {
  Log,
  Event,
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

export abstract class LayerBase<T extends LayerOptions = LayerOptions> {
  abstract data: Maybe<DataShape>

  abstract setData(data?: Maybe<DataShape>): void

  abstract setScale(scale?: Maybe<LayerScalesShape>): void

  abstract setStyle(style?: Maybe<AnyObject>): void

  abstract update(): void

  abstract draw(): void

  readonly log: Log

  readonly event: Event

  readonly className: string

  readonly options: T & ChartContext

  protected readonly root: DrawerTarget

  protected readonly sublayers

  protected readonly tooltipTargets

  protected readonly selector

  private backupData: BackupDataShape<AnyObject> = {}

  private backupEvent: AnyObject = {}

  private backupAnimation: BackupAnimationShape = {timer: {}}

  private needRecalculated = false

  constructor({options, context, sublayers, tooltipTargets}: LayerBaseProps<T>) {
    this.className = this.constructor.name
    this.log = createLog(this.className)
    this.event = createEvent(this.className)
    this.options = merge(options, context)
    this.sublayers = sublayers || []
    this.tooltipTargets = tooltipTargets || []
    this.sublayers.forEach((name) => (this.backupData[name] = []))
    this.selector = new Selector(this.options.engine)
    this.root = this.selector.createSubcontainer(this.options.root, this.className)!
    this.backupData = Object.fromEntries(this.sublayers.map((name) => [name, []]))
    this.createLifeCycles()
    this.createEvent()
  }

  private createEvent() {
    const {tooltip} = this.options,
      getMouseEvent = (event: ElEvent): MouseEvent =>
        event instanceof MouseEvent ? event : event.e,
      getData = (event: ElEvent, data?: ElConfigShape): ElConfigShape =>
        event instanceof MouseEvent ? data : (event.target as any)

    this.backupEvent = {
      common: {},
      tooltip: {
        mouseout: () => tooltip.hide(),
        mousemove: (event: ElEvent) => {
          tooltip.move(getMouseEvent(event))
        },
        mouseover: (event: ElEvent, data?: ElConfigShape) => {
          tooltip.update({
            backup: this.backupData,
            data: getData(event, data),
          })
          tooltip.show(getMouseEvent(event))
        },
      },
    }

    COMMON_EVENTS.forEach((type) => {
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
    LAYER_LIFE_CYCLES.forEach((name) => {
      const instance = this
      const fn: Function = instance[name] || noop

      instance[name] = (...parameters: any) => {
        try {
          if (name === 'draw') {
            instance.update()
          } else if (name === 'update' && !instance.needRecalculated) {
            return
          }

          instance.event.fire(`before:${name}`, {...parameters})
          fn.call(instance, ...parameters)
          instance.event.fire(name, {...parameters})

          if (name === 'setData' || name === 'setScale' || name === 'setStyle') {
            instance.needRecalculated = true
          } else if (name === 'update') {
            instance.needRecalculated = false
          }
        } catch (error) {
          instance.log.error('Layer life cycle call exception', error)
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
    const {selector} = this,
      className = `${this.className}-${sublayer}`,
      target = sublayer ? selector.getSubcontainer(this.root, className) : this.root
    selector.setVisible(target, visible)
  }

  private setEvent = (sublayer: string) => {
    if (isSvgContainer(this.root)) {
      const els = this.root.selectAll(`.chart-basic-${sublayer}`).style('cursor', 'pointer')
      COMMON_EVENTS.forEach((type) =>
        els.on(`${type}.common`, this.backupEvent.common[type][sublayer])
      )
    } else if (isCanvasContainer(this.root)) {
      const objects = this.root.getObjects() as FabricObject[]
      const els = objects.filter(({className}) => className === `chart-basic-${sublayer}`)
      COMMON_EVENTS.forEach((type) =>
        els.forEach((el) => el.on(type, this.backupEvent.common[type][sublayer]))
      )
    }
  }

  private setTooltip = (sublayer: string) => {
    if (this.tooltipTargets.indexOf(sublayer) !== -1) {
      if (isSvgContainer(this.root)) {
        const els = this.root.selectAll(`.chart-basic-${sublayer}`)
        TOOLTIP_EVENTS.forEach((type) => els.on(`${type}.tooltip`, this.backupEvent.tooltip[type]))
      } else if (isCanvasContainer(this.root)) {
        const objects = this.root.getObjects() as FabricObject[],
          els = objects.filter(({className}) => className === `chart-basic-${sublayer}`)
        TOOLTIP_EVENTS.forEach((type) =>
          els.forEach((el) => el.on(type, this.backupEvent.tooltip[type]))
        )
      }
    }
  }

  private createAnimation = (sublayer: string) => {
    const {options} = this.backupAnimation,
      targets = this.selector.getChildren(this.root, `chart-basic-${sublayer}`),
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
      this.log.error('Invalid sublayer type')
      return
    }

    const {selector} = this,
      sublayerClassName = `${this.className}-${sublayer}`,
      sublayerContainer =
        selector.getSubcontainer(this.root, sublayerClassName) ||
        selector.createSubcontainer(this.root, sublayerClassName)

    // delete the redundant group in the last rendering
    for (let i = 0; i < Math.max(this.backupData[sublayer].length, data.length); i++) {
      const groupClassName = `${sublayerClassName}-${i}`
      let groupContainer = selector.getSubcontainer(sublayerContainer, groupClassName)

      if (i < data.length && !groupContainer) {
        groupContainer = selector.createSubcontainer(sublayerContainer, groupClassName)
      } else if (i >= data.length) {
        selector.remove(groupContainer)
      }
    }

    this.backupData[sublayer].length = data.length

    data.forEach((groupData, i) => {
      if (!isEqual(this.backupData[sublayer][i], groupData)) {
        const groupClassName = `${sublayerClassName}-${i}`,
          groupContainer = selector.getSubcontainer(sublayerContainer, groupClassName),
          options: GraphDrawerProps<any> = {
            engine: this.selector.engine,
            className: `chart-basic-${sublayer}`,
            container: groupContainer!,
            data: [],
          }

        options.enableUpdateAnimation = false
        !groupData.hide && merge(options, groupData)

        if (this.backupData[sublayer][i] && this.backupAnimation.options?.[sublayer]) {
          const {duration, delay} = this.backupAnimation.options[sublayer].update || {}
          options.enableUpdateAnimation = true
          options.updateAnimationDuration = duration
          options.updateAnimationDelay = delay
        }

        drawerMapping[type](options)
        this.backupData[sublayer][i] = groupData
      }
    })

    this.setEvent(sublayer)
    this.setTooltip(sublayer)
    this.createAnimation(sublayer)
  }

  destroy() {
    this.sublayers.forEach((name) => this.backupAnimation[name]?.destroy())
    this.root && this.selector.remove(this.root)
  }
}
