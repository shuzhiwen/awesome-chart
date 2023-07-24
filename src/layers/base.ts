import {cloneDeep, isArray, isEqual, isFunction, merge, noop, range} from 'lodash'
import {Graphics} from 'pixi.js'
import {AnimationQueue} from '../animation'
import {DrawerDict} from '../draws'
import {
  CacheLayerAnimation,
  CacheLayerData,
  CacheLayerEvent,
  ChartContext,
  DrawBasicProps,
  DrawerTarget,
  DrawerType,
  ElConfig,
  ElEvent,
  LayerAnimation,
  LayerBaseProps,
  LayerData,
  LayerOptions,
  LayerScale,
  LayerStyle,
} from '../types'
import {
  commonEvents,
  createLog,
  EventManager,
  group,
  isCC,
  isSC,
  layerLifeCycles,
  tooltipEvents,
  ungroup,
} from '../utils'
import {makeClass, selector} from './helpers'

export abstract class LayerBase<Options extends LayerOptions> {
  abstract data: Maybe<LayerData>

  abstract style: Maybe<AnyObject>

  /**
   * Preliminary conversion of raw data and styles into drawing data.
   * The update function is the main performance cost of the layer.
   */
  abstract update(...args: unknown[]): void

  /**
   * The drawing method of the layer,
   * which converts the drawing data generated by update into a format
   * that can be recognized by drawBasic.
   * @see drawBasic
   */
  abstract draw(): void

  /**
   * Declare what elements the layer contains.
   * Each sublayer is associated with a base element type.
   */
  readonly sublayers

  /**
   * Declare which elements can interact.
   * The `interactive` must be a subset of sublayers.
   */
  readonly interactive

  /**
   * The className is used to classify drawing elements of different layers.
   */
  readonly className = this.constructor.name

  /**
   * Manage lifecycle or tooltip events.
   */
  readonly event = new EventManager<string, 'internal' | 'user'>(this.className)

  readonly options: Options & ChartContext

  readonly cacheData: CacheLayerData<unknown> = {}

  readonly cacheAnimation: CacheLayerAnimation

  protected readonly cacheEvent = {} as CacheLayerEvent

  protected readonly log = createLog(this.className)

  /**
   * In order to save unnecessary layer data calculation,
   * this property is used to identify whether the update function should be called.
   * @see update
   */
  protected needRecalculated = false

  /**
   * The root element of the layer below the chart root element.
   */
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
  }

  private createEvent() {
    const {tooltip} = this.options,
      getMouseEvent = (event: ElEvent): MouseEvent =>
        event instanceof MouseEvent ? event : (event.nativeEvent as MouseEvent),
      getData = (event: ElEvent, data?: ElConfig): ElConfig =>
        event instanceof MouseEvent ? data! : (event.target as Graphics).data!,
      getTarget = (event: ElEvent): EventTarget =>
        event instanceof MouseEvent ? event.target! : event.target

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
                target: getTarget(event),
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

  /**
   * Set the data of the layer.
   * This method will force the layer to recalculate.
   * @see needRecalculated
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  setData(_: Maybe<LayerData>) {}

  /**
   * Set the scale of the layer.
   * This method will force the layer to recalculate.
   * @see needRecalculated
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  setScale(_: Maybe<LayerScale>) {}

  /**
   * Set the style of the layer.
   * This method may force the layer to recalculate.
   * @see needRecalculated
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  setStyle(_: Maybe<LayerStyle<AnyObject>>) {}

  /**
   * Set the animation of the layer and generate the corresponding animation queue.
   * Calling this method will cause the animation in progress to stop.
   */
  setAnimation(config: Maybe<LayerAnimation<CacheLayerAnimation['options']>>) {
    merge(this.cacheAnimation, {
      options: isFunction(config) ? config(this.options.theme) : config,
    })
    this.sublayers.forEach((sublayer) => {
      this.createAnimation(sublayer)
    })
  }

  /**
   * Trigger the animation queue of all sublayers at the same time.
   * Be careful not to call this method frequently in a short period of time.
   */
  playAnimation() {
    setTimeout(() => {
      this.sublayers.forEach((type) => this.cacheAnimation.animations[type]?.play())
    })
  }

  /**
   * Hide/Show layer or sublayer.
   * @param visible
   * Set the layer or sublayer to be visible or invisible.
   * @param sublayer
   * Specifies the sublayer to show/hide, undefined means the entire layer.
   */
  setVisible(visible: boolean, sublayer?: string) {
    const className = `${this.className}-${sublayer}`
    const target = sublayer ? selector.getDirectChild(this.root, className) : this.root
    selector.setVisible(target, visible)
  }

  /**
   * After drawing, all elements need to be event bound.
   * @remarks
   * It should be noted that the click event only supports svg.
   * If canvas event is not corresponding, mostly because of element occlusion.
   * @param sublayer
   * The target elements.
   */
  private bindEvent(sublayer: string) {
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

  /**
   * After drawing, all elements need to be animated.
   * @remarks
   * The number of animation queues is not fixed,
   * which means that not all sublayers have enter or loop animation.
   * @param sublayer
   * The target elements.
   */
  private createAnimation(sublayer: string) {
    if (this.cacheAnimation.animations[sublayer]) {
      this.cacheAnimation.animations[sublayer]?.destroy()
    }

    const {options} = this.cacheAnimation,
      {animation} = this.options.theme,
      /**
       * Select elements must await animation to be destroyed.
       * Otherwise the elements created by the last animation will be selected.
       */
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

    const animationQueue = new AnimationQueue({loop: false}),
      enterQueue = new AnimationQueue({loop: false, id: 'enter'}),
      loopQueue = new AnimationQueue({loop: true, id: 'loop'}),
      update = merge({}, animation.update, options[sublayer].update),
      enter = group(options[sublayer].enter),
      loop = group(options[sublayer].loop),
      event = animationQueue.event

    if (isFirstPlay && enter.length) {
      animationQueue.pushQueue(enterQueue)
      enter.forEach((item) => {
        const config = merge({targets}, animation.enter, item)
        enterQueue.pushAnimation(config.type!, config, this.root)
      })
    }

    if (loop.length) {
      animationQueue.pushQueue(loopQueue)
      loop.forEach((item) => {
        const config = merge({targets}, animation.loop, item)
        loopQueue.pushAnimation(config.type!, config, this.root)
      })
    }

    event.on('start', 'base', (d) => this.event.fire(`${prefix}start`, d))
    event.on('process', 'base', (d) => this.event.fire(`${prefix}process`, d))
    event.on('end', 'base', (d) => this.event.fire(`${prefix}end`, d))
    this.cacheAnimation.animations[sublayer] = animationQueue

    /**
     * Loop animation should await for update animation after draw.
     * If the layer is drawn multiple times in a short period of time,
     * use a timer to debounce.
     */
    if (!isFirstPlay) {
      clearTimeout(this.cacheAnimation.timer[sublayer])
      this.cacheAnimation.timer[sublayer] = setTimeout(
        () => this.cacheAnimation.animations[sublayer]?.play(),
        update.duration + update.delay
      )
    }
  }

  /**
   * Unified layer drawing function to map drawing data to graphics.
   * Layers should always be drawn using this method.
   */
  protected drawBasic<T extends DrawerType>(props: DrawBasicProps<T>) {
    let data = props.data
    const {type, sublayer = type} = props,
      cacheData = this.cacheData[sublayer],
      sublayerClassName = `${this.className}-${sublayer}`,
      maxGroupLength = Math.max(cacheData.data.length, data.length),
      isFirstDraw = cacheData.data.length === 0,
      sublayerContainer =
        selector.getDirectChild(this.root, sublayerClassName) ||
        selector.createGroup(this.root, sublayerClassName)

    if (!this.sublayers.includes(sublayer)) {
      this.log.debug.error('Invalid sublayer type for drawBasic')
      return
    }

    /**
     * If data length is more than last time, add missing group container.
     * If data length is less than last time, remove redundant group container.
     */
    range(0, maxGroupLength).map((groupIndex) => {
      const groupClassName = `${sublayerClassName}-${groupIndex}`
      const groupContainer = selector.getDirectChild(sublayerContainer, groupClassName)

      if (groupIndex < data.length && !groupContainer) {
        selector.createGroup(sublayerContainer, groupClassName)
      } else if (groupIndex >= data.length) {
        selector.remove(groupContainer)
      }
    })

    /**
     * Unified insertion of groupIndex and itemIndex into the source data.
     * Layers should avoid reimplementing these two fields.
     */
    cacheData.data.length = data.length
    data.forEach((groupData, groupIndex) => {
      groupData.source = groupData.data.map((_, itemIndex) => {
        const target = groupData.source?.[itemIndex]
        if (!isArray(target)) return {...target, groupIndex, itemIndex}
        else return target.map((item) => ({...item, groupIndex, itemIndex}))
      })
    })

    /**
     * Readjust group ordering based on last render data.
     * This is done to avoid unnecessary animation when the data is updated.
     */
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

    /**
     * Call the render method once per group of data.
     * Skip rendering if data hasn't changed to optimize performance.
     * Data update animation is not triggered on first render.
     */
    data.forEach((groupData, i) => {
      if (groupData.hidden || isEqual(cacheData.data[i], groupData)) return

      const groupClassName = `${sublayerClassName}-${i}`
      const groupContainer = selector.getDirectChild(sublayerContainer, groupClassName)
      const options = {
        ...groupData,
        transition:
          isFirstDraw || groupData.disableUpdateAnimation
            ? {duration: 0, delay: 0}
            : this.cacheAnimation.options[sublayer]?.update,
        className: makeClass(sublayer, false),
        container: groupContainer,
        theme: this.options.theme,
      }

      DrawerDict[type](options as any)
      cacheData.data[i] = cloneDeep(groupData as any)
    })

    this.bindEvent(sublayer)
    this.createAnimation(sublayer)
  }

  destroy() {
    this.sublayers.forEach((name) => this.cacheAnimation.animations[name]?.destroy())
    this.root && selector.remove(this.root)
  }
}
