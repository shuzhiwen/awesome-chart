import {cloneDeep, isEqual, merge, noop, range} from 'lodash'
import {Graphics} from 'pixi.js'
import {AnimationQueue} from '../anims'
import {commonEvents, layerLifeCycles, tooltipEvents} from '../core'
import {DataBase} from '../data'
import {DrawerDict} from '../draws'
import {
  CacheLayerAnimation,
  CacheLayerData,
  CacheLayerEvent,
  DrawBasicProps,
  DrawerTarget,
  DrawerType,
  ElConfig,
  ElEvent,
  LayerAnimation,
  LayerBaseProps,
  LayerScale,
  LayerStyle,
} from '../types'
import {
  EventManager,
  compute,
  createLog,
  fromEntries,
  group,
  isCC,
  isSC,
  ungroup,
} from '../utils'
import {elClass, selector} from './helpers'

export abstract class LayerBase<Key extends string> {
  /**
   * Record raw data for layer elements.
   */
  abstract data: Maybe<DataBase>

  /**
   * Record style information for layer elements.
   */
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
   * Manage element events.
   */
  readonly event = new EventManager<
    `${Keys<typeof commonEvents>}-${Key}`,
    (props: {event: MouseEvent; data: ElConfig; target: EventTarget}) => void
  >()

  /**
   * Manage lifecycle or tooltip events.
   */
  readonly systemEvent = new EventManager<
    `${Keys<typeof layerLifeCycles>}`,
    AnyFunction
  >()

  readonly cacheAnimation: CacheLayerAnimation<Key>

  readonly cacheEvent: CacheLayerEvent<Key>

  readonly cacheData: CacheLayerData<Key>

  readonly options

  readonly log

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

  constructor({options, sublayers, interactive}: LayerBaseProps<Key>) {
    this.options = options
    this.sublayers = sublayers || []
    this.interactive = interactive || []
    this.log = createLog(this.options.id)
    this.root = selector.createGroup(this.options.root, this.options.id)
    this.cacheData = fromEntries(this.sublayers.map((key) => [key, {data: []}]))
    this.cacheAnimation = {animations: {}, options: {}, timer: {}}
    this.cacheEvent = this.initializeEvent()
    this.initializeLifeCycles()
  }

  private initializeEvent(): CacheLayerEvent<Key> {
    const {tooltip} = this.options,
      getMouseEvent = (event: ElEvent): MouseEvent =>
        event instanceof MouseEvent ? event : (event.nativeEvent as MouseEvent),
      getData = (event: ElEvent, data: ElConfig): ElConfig =>
        event instanceof MouseEvent ? data : (event.target as Graphics).data!,
      getTarget = (event: ElEvent): EventTarget =>
        event instanceof MouseEvent ? event.target! : event.target

    return {
      'tooltip.mouseout': () => tooltip.hide(),
      'tooltip.mousemove': (event: ElEvent) =>
        tooltip.move(getMouseEvent(event)),
      'tooltip.mouseover': (event: ElEvent, data: ElConfig) => {
        tooltip.update({data: getData(event, data)})
        tooltip.show(getMouseEvent(event))
      },
      ...fromEntries(
        Array.from(commonEvents).map((type) => [
          `common.${type}`,
          fromEntries(
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
        ])
      ),
    }
  }

  private initializeLifeCycles() {
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

          fn.call(this, ...parameters)
          this.systemEvent.fire(name, {...parameters})

          if (
            name === 'setData' ||
            name === 'setScale' ||
            name === 'setStyle'
          ) {
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
  setData(_: Maybe<DataBase>) {}

  /**
   * Set the scale of the layer.
   * This method will force the layer to recalculate.
   * @see needRecalculated
   */
  setScale(_: Maybe<LayerScale>) {}

  /**
   * Set the style of the layer.
   * This method may force the layer to recalculate.
   * @see needRecalculated
   */
  setStyle(_: Maybe<LayerStyle<AnyObject>>) {}

  /**
   * Set the animation of the layer and generate animation queues.
   * Calling this method will cause the animation in progress to stop.
   */
  setAnimation(
    config: Maybe<LayerAnimation<CacheLayerAnimation<Key>['options']>>
  ) {
    merge(this.cacheAnimation, {options: compute(config, this.options.theme)})
    this.sublayers.forEach((sublayer) => this.createAnimation(sublayer))
  }

  /**
   * Trigger the animation queue of all sublayers at the same time.
   * Be careful not to call this method frequently in a short period of time.
   */
  playAnimation() {
    setTimeout(() => {
      this.sublayers.forEach((type) =>
        this.cacheAnimation.animations[type]?.play()
      )
    })
  }

  /**
   * Hide/Show layer or sublayer.
   * @param visible
   * Set the layer or sublayer to be visible or invisible.
   * @param sublayer
   * Specifies the sublayer to show/hide, undefined means the entire layer.
   */
  setVisible(visible: boolean, sublayer?: Key) {
    const target = sublayer
      ? selector.getDirectChild(this.root, `${this.options.id}-${sublayer}`)
      : this.root
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
  private bindEvent(sublayer: Key) {
    if (isSC(this.root)) {
      const els = selector
        .getChildren(this.root, elClass(sublayer))
        .style('cursor', 'pointer')

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
      const els = selector.getChildren(this.root, elClass(sublayer))

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
  private createAnimation(sublayer: Key) {
    const {options} = this.cacheAnimation,
      {animation} = this.options.theme,
      /**
       * Select elements must await animation to be destroyed.
       * Otherwise the elements created by the last animation will be selected.
       */
      targets = selector.getChildren(this.root, elClass(sublayer)),
      isFirstPlay = !this.cacheAnimation.animations[sublayer]

    if (
      !options[sublayer] ||
      this.cacheData[sublayer].data.length === 0 ||
      (isSC(targets) ? targets.size() === 0 : targets.length === 0)
    ) {
      this.cacheAnimation.animations[sublayer] = null
      return
    }

    const animationQueue = new AnimationQueue({loop: false}),
      enterQueue = new AnimationQueue({loop: false, id: 'enter'}),
      loopQueue = new AnimationQueue({loop: true, id: 'loop'}),
      update = merge({}, animation.update, options[sublayer]?.update),
      enter = group(options[sublayer]?.enter),
      loop = group(options[sublayer]?.loop)

    if (isFirstPlay && enter.length) {
      animationQueue.pushQueue(enterQueue)
      enter.forEach((item) => {
        const config = merge({targets}, animation.enter, item)
        enterQueue.pushAnimation({...config, context: this.root})
      })
    }

    if (loop.length) {
      animationQueue.pushQueue(loopQueue)
      loop.forEach((item) => {
        const config = merge({targets}, animation.loop, item)
        loopQueue.pushAnimation({...config, context: this.root})
      })
    }

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
  protected drawBasic<T extends DrawerType>(props: DrawBasicProps<T, Key>) {
    const {type, key, data} = props,
      cacheData = this.cacheData[key],
      isFirstDraw = cacheData.data.length === 0,
      sublayerClassName = `${this.options.id}-${key}`,
      maxGroupLength = Math.max(cacheData.data.length, data.length),
      sublayerContainer =
        selector.getDirectChild(this.root, sublayerClassName) ||
        selector.createGroup(this.root, sublayerClassName)

    /**
     * Unified insertion of groupIndex and itemIndex into the source data.
     * Layers should avoid reimplementing these two fields.
     */
    let nextData = data.map((groupData, groupIndex) => ({
      ...groupData,
      source: groupData.data.map((datum, itemIndex) => ({
        meta: datum.meta ?? {},
        groupIndex,
        itemIndex,
      })),
    }))

    /**
     * If data length is more than last time, add missing group container.
     * If data length is less than last time, remove redundant group container.
     */
    range(0, maxGroupLength).map((i) => {
      const groupClassName = `${sublayerClassName}-${i}`
      const groupContainer = selector.getDirectChild(
        sublayerContainer,
        groupClassName
      )

      if (nextData[i]?.hidden) {
        return
      } else if (i < nextData.length && !groupContainer) {
        selector.createGroup(sublayerContainer, groupClassName)
      } else if (i >= nextData.length) {
        selector.remove(groupContainer)
      }
    })

    /**
     * Readjust group ordering based on last render data.
     * This is done to avoid unnecessary animation when the data is updated.
     */
    if (!cacheData.order) {
      cacheData.order = new Map(
        nextData
          .filter(({source}) => ungroup(source)?.meta.dimension)
          .map(({source}, i) => [ungroup(source)?.meta.dimension, i])
      )
    } else {
      const {order: prevOrder} = cacheData,
        orderedGroupData = new Array(nextData.length),
        curOrder = nextData.map(({source}) => ungroup(source)?.meta.dimension)

      curOrder.forEach((dimension, i) => {
        if (prevOrder.has(dimension)) {
          orderedGroupData[prevOrder.get(dimension)!] = nextData[i]
        } else {
          orderedGroupData.push(nextData[i])
        }
      })
      prevOrder.clear()
      nextData = orderedGroupData.filter(Boolean)
      nextData.forEach(({source}, i) => {
        const dimension = ungroup(source)?.meta.dimension
        dimension && prevOrder.set(dimension, i)
      })
    }

    /**
     * Call the render method once per group of data.
     * Skip rendering if data hasn't changed to optimize performance.
     * Data update animation is not triggered on first render.
     */
    cacheData.data.length = nextData.length
    nextData.forEach(({hidden, disableUpdateAnimation, ...datum}, i) => {
      if (hidden || isEqual(cacheData.data[i], datum)) {
        return
      }

      const groupClassName = `${sublayerClassName}-${i}`
      const groupContainer = selector.getDirectChild(
        sublayerContainer,
        groupClassName
      )
      const options = {
        ...datum,
        transition:
          isFirstDraw || disableUpdateAnimation
            ? {duration: 0, delay: 0}
            : this.cacheAnimation.options[key]?.update,
        className: elClass(key),
        container: groupContainer,
        theme: this.options.theme,
      }

      this.cacheAnimation.animations[key]?.destroy()
      cacheData.data[i] = cloneDeep(datum)
      DrawerDict[type](options as never)
    })

    this.bindEvent(key)
    this.createAnimation(key)
  }

  destroy() {
    this.root && selector.remove(this.root)
    this.sublayers.forEach((name) =>
      this.cacheAnimation.animations[name]?.destroy()
    )
  }
}
