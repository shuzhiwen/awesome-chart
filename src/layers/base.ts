import {isEqual, isNil, merge, noop} from 'lodash'
import {AnimationQueue} from '../animation'
import {drawerMapping} from '../drawer'
import {Selector} from './helpers'
import {
  COMMON_EVENTS,
  LAYER_LIFE_CYCLES,
  TOOLTIP_EVENTS,
  isSvgContainer,
  isCanvasContainer,
} from '../utils'
import {
  Log,
  Event,
  BackupShape,
  ElConfigShape,
  DataShape,
  DrawBasicProps,
  DrawerTarget,
  ElEvent,
  FabricObject,
  GraphDrawerProps,
  LayerBaseProps,
  LayerSchema,
} from '../types'

export abstract class LayerBase {
  abstract readonly log: Log

  abstract readonly event: Event

  abstract data: Maybe<DataShape>

  abstract setData(data: Maybe<DataShape>, scale?: AnyObject): void

  abstract setStyle(style?: AnyObject): void

  abstract draw(): void

  readonly options

  readonly className: string = 'awesome-base'

  private backupData: BackupShape<any> = {}

  private backupEvent: AnyObject = {}

  private backupAnimation: AnyObject = {options: {}}

  protected readonly root: DrawerTarget

  protected sublayers

  protected tooltipTargets

  protected selector

  constructor({options, context, sublayers, tooltipTargets}: LayerBaseProps) {
    this.options = merge(options, context)
    this.sublayers = sublayers || []
    this.tooltipTargets = tooltipTargets || []
    this.sublayers.forEach((name) => (this.backupData[name] = []))
    this.selector = new Selector(this.options.engine)
    this.root = this.selector.createSubContainer(this.options.root, this.className)!
    this.createEvent()
    this.createLifeCycles()
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
    // basic mouse event
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
      const fn: Function = this[name] || noop

      this[name] = (...parameters: any[]) => {
        try {
          this.event.fire(`before:${name}`, {...parameters})
          fn.call(this, ...parameters)
          this.event.fire(name, {...parameters})
        } catch (error) {
          this.log.error('layer life cycle call exception', error)
        }
      }
    })
  }

  setAnimation(options: AnyObject) {
    merge(this.backupAnimation, {options})
  }

  playAnimation() {
    this.sublayers.forEach((type) => this.backupAnimation[type]?.play())
  }

  update({data, style, animation}: LayerSchema) {
    !isNil(data) && this.setData(data)
    !isNil(style) && this.setStyle(style)
    !isNil(animation) && this.setAnimation(animation)
    this.draw()
  }

  setVisible(visible: boolean, sublayer?: string) {
    const {selector} = this,
      className = `${this.className}-${sublayer}`,
      target = sublayer ? selector.getFirstChildByClassName(this.root, className) : this.root
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
    const {engine} = this.options,
      {options} = this.backupAnimation,
      prefix = `${sublayer}-animation-`
    let isFirstPlay = true

    if (this.backupAnimation[sublayer]) {
      this.backupAnimation[sublayer].destroy()
      isFirstPlay = false
    }

    if (this.backupData[sublayer].length === 0 || !options || !options[sublayer]) {
      this.backupAnimation[sublayer] = null
      return
    }

    const animationQueue = new AnimationQueue({options: {loop: false}}),
      enterQueue = new AnimationQueue({options: {loop: false}}),
      loopQueue = new AnimationQueue({options: {loop: false}}),
      {enter, loop, update} = options[sublayer],
      targets = `.awesome-basic-${sublayer}`
    this.backupAnimation[sublayer] = animationQueue

    isFirstPlay && animationQueue.push('queue', enterQueue, this.root)
    isFirstPlay && enter && enterQueue.push(enter.type, {...enter, targets, engine}, this.root)
    loop && loopQueue.push(loop.type, {...loop, targets, engine}, this.root)
    animationQueue.push('queue', loopQueue, this.root)

    animationQueue.event.on('start', (d: any) => this.event.fire(`${prefix}start`, d))
    animationQueue.event.on('process', (d: any) => this.event.fire(`${prefix}process`, d))
    animationQueue.event.on('end', (d: any) => this.event.fire(`${prefix}end`, d))

    if (!isFirstPlay) {
      clearTimeout(this.backupAnimation[sublayer].timer)
      const {duration = 2000, delay = 0} = update || {}
      this.backupAnimation[sublayer].timer = setTimeout(
        () => this.backupAnimation[sublayer].play(),
        duration + delay
      )
    }
  }

  protected drawBasic = ({type, data, sublayer = type}: DrawBasicProps) => {
    const {selector} = this,
      sublayerClassName = `${this.className}-${sublayer}`
    let sublayerContainer =
      selector.getFirstChildByClassName(this.root, sublayerClassName) ||
      selector.createSubContainer(this.root, sublayerClassName)

    // group container preparation: delete the redundant group in the last rendering
    for (let i = 0; i < Math.max(this.backupData[sublayer].length, data.length); i++) {
      const groupClassName = `${sublayerClassName}-${i}`
      let groupContainer = selector.getFirstChildByClassName(sublayerContainer, groupClassName)

      if (i < data.length && !groupContainer) {
        groupContainer = selector.createSubContainer(sublayerContainer, groupClassName)
      } else if (i >= data.length) {
        selector.remove(groupContainer)
      }
    }

    for (let i = 0; i < data.length; i++) {
      this.backupData[sublayer].length = data.length
      if (!isEqual(this.backupData[sublayer][i], data[i])) {
        const groupClassName = `${sublayerClassName}-${i}`,
          groupContainer = selector.getFirstChildByClassName(sublayerContainer, groupClassName),
          options: GraphDrawerProps<any> = {
            engine: this.selector.engine,
            className: `awesome-basic-${sublayer}`,
            container: groupContainer!,
            data: [],
          }

        !data[i].hide && merge(options, data[i])
        options.enableUpdateAnimation = false

        if (this.backupData[sublayer][i] && this.backupAnimation.options[sublayer]) {
          const {duration, delay} = this.backupAnimation.options[sublayer].update || {}
          options.enableUpdateAnimation = true
          options.updateAnimationDuration = duration
          options.updateAnimationDelay = delay
        }

        drawerMapping[type](options)
        this.backupData[sublayer][i] = data[i]
      }
    }

    this.setEvent(sublayer)
    this.setTooltip(sublayer)
    this.createAnimation(sublayer)
  }

  destroy() {
    this.sublayers.forEach((name) => this.backupAnimation[name]?.destroy())
    this.root && this.selector.remove(this.root)
  }
}
