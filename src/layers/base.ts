import chroma from 'chroma-js'
import {cloneDeep, isArray, isEqual, isNil, merge, noop} from 'lodash'
import {dataMapping, DataTableList} from '../data'
import {AnimationQueue} from '../animation'
import {drawerMapping} from '../draws'
import {
  COMMON_EVENTS,
  LAYER_LIFE_CYCLES,
  SCALE_TYPE,
  TOOLTIP_EVENTS,
  formatNumber,
  Selector,
  getTextWidth,
  ColorMatrix,
  isSvgContainer,
  isCanvasContainer,
  getAttr,
} from '../utils'
import {
  Log,
  Event,
  BackupShape,
  ElConfigShape,
  CreateTextProps,
  DataShape,
  DataType,
  DrawBasicProps,
  DrawerTarget,
  ElEvent,
  FabricObject,
  GraphDrawerProps,
  LayerBaseProps,
  LayerScalesShape,
  LayerSchema,
  CreateColorMatrixProps,
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
    this.initializeEvent()
    this.createLifeCycles()
  }

  // avoid repeated binding
  private initializeEvent() {
    const {tooltip} = this.options
    const getMouseEvent = (event: ElEvent): MouseEvent =>
      event instanceof MouseEvent ? event : event.e
    const getData = (event: ElEvent, data?: ElConfigShape): ElConfigShape =>
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
      const instance = this
      const fn: Function = instance[name] || noop
      instance[name] = (...parameters: any[]) => {
        try {
          instance.event.fire(`before:${name}`, {...parameters})
          fn.call(instance, ...parameters)
          instance.event.fire(name, {...parameters})
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

  // color enhance function
  createColorMatrix({row, column, customColors, nice = true}: CreateColorMatrixProps) {
    let matrix: string[][] = []
    let originColors = this.options.theme
    const order = this.data?.options?.order

    if (customColors) {
      originColors = isArray(customColors) ? customColors : [customColors]
    }

    // the order from legend layer
    if (order && order.colorMatrix && this.data instanceof DataTableList) {
      const data = this.data?.data
      const {type, mapping} = order
      matrix = cloneDeep(order.colorMatrix.matrix)
      // filter colors
      if (type === 'row') {
        const selected = data[0].list.map((dimension) => mapping[dimension])
        selected.sort()
        matrix = selected.map((index) => matrix[index])
      } else if (type === 'column') {
        const selected = data.slice(1).map(({header}) => mapping[header])
        selected.sort()
        matrix = matrix.map((row) => selected.map((index) => row[index]))
        // one column and multiple columns have different color picking methods
        if (selected.length === 1) {
          while (matrix.length < data[0].list.length) {
            matrix.push(matrix[0])
          }
        }
      }
      return new ColorMatrix(matrix)
    }

    // new color matrix
    if (column === 1) {
      matrix = chroma
        .scale(originColors)
        .mode('lch')
        .colors(row)
        .map((color) => [color])
    } else {
      const rowColors = chroma
        .scale(originColors)
        .mode('lch')
        .colors(row + 1)
      // extends one dimension to two dimensions
      rowColors.reduce((prevColor, curColor, index) => {
        const count = index === row ? column : column + 1
        matrix.push(chroma.scale([prevColor, curColor]).mode('lch').colors(count))
        return curColor
      })
    }

    // nice matrix automatically
    const colorMatrix = new ColorMatrix(matrix)
    nice && !customColors && colorMatrix.nice()
    return colorMatrix
  }

  // merge scale for the whole layer
  createScale<T extends LayerScalesShape>(defaultScale: T, currentScale: T, incomingScale: T) {
    const nice = merge(defaultScale?.nice, currentScale?.nice, incomingScale?.nice)
    const scales: LayerScalesShape = {nice}

    SCALE_TYPE.forEach((type) => {
      // scales which generate by layer itself has lowest priority
      scales[type] = incomingScale?.[type] || currentScale?.[type] || defaultScale?.[type]
    })

    return scales
  }

  validateAndCreateData(
    dataType: DataType,
    currentData: Maybe<DataShape>,
    incomingData: Maybe<DataShape>,
    filter?: Function
  ) {
    if (!incomingData) {
      return currentData
    } else if (!(incomingData instanceof dataMapping[dataType])) {
      throw new Error('require the right data processor')
    }

    return filter ? filter(incomingData) : incomingData
  }

  // merge style for the whole layer
  createStyle<T>(defaultStyle: T, currentStyle: T, incomingStyle: T): T {
    return merge({}, defaultStyle, currentStyle, incomingStyle)
  }

  // handle texts in the chart
  createText({x, y, value, style = {}, position = 'right-top', offset = 0}: CreateTextProps) {
    let [positionX, positionY] = [x, y]
    const {fontSize: _fontSize, writingMode, format} = style
    const fontSize = getAttr(_fontSize, 0, 12)
    const formattedText = String(formatNumber(value, format))
    const textWidth = getTextWidth(formattedText, fontSize)

    if (position === 'center') {
      positionX -= textWidth / 2
      positionY += fontSize / 2
    } else if (position === 'left') {
      positionX -= textWidth + offset
      positionY += fontSize / 2
    } else if (position === 'right') {
      positionX += offset
      positionY += fontSize / 2
    } else if (position === 'top') {
      positionX -= textWidth / 2
      positionY -= offset
    } else if (position === 'bottom') {
      positionX -= textWidth / 2
      positionY += fontSize + offset
    } else if (position === 'left-top') {
      positionX -= textWidth + offset
      positionY -= offset
    } else if (position === 'right-top') {
      positionX += offset
      positionY -= offset
    } else if (position === 'left-bottom') {
      positionX -= textWidth + offset
      positionY += fontSize + offset
    } else if (position === 'right-bottom') {
      positionX += offset
      positionY += fontSize + offset
    }
    // Relocate position according to the 'writingMode'.
    // But still has a problem: font height
    if (writingMode === 'vertical-rl') {
      positionX += textWidth / 2
      positionY += -fontSize
    }
    // offset fix
    if (isArray(style.offset)) {
      positionX += style.offset[0]
      positionY -= style.offset[1]
    }

    return {
      x: positionX,
      y: positionY,
      value: formattedText,
      transformOrigin: `${x}px ${y}px`,
      textWidth,
    }
  }

  setVisible(visible: boolean, sublayer?: string) {
    const {selector} = this
    const className = `${this.className}-${sublayer}`
    const target = sublayer ? selector.getFirstChildByClassName(this.root, className) : this.root

    selector.setVisible(target, visible)
  }

  private setEvent = (sublayer: string) => {
    const {engine} = this.selector

    if (engine === 'svg' && isSvgContainer(this.root)) {
      const els = this.root.selectAll(`.chart-basic-${sublayer}`).style('cursor', 'pointer')
      COMMON_EVENTS.forEach((type) =>
        els.on(`${type}.common`, this.backupEvent.common[type][sublayer])
      )
    } else if (engine === 'canvas' && isCanvasContainer(this.root)) {
      const objects = this.root.getObjects() as FabricObject[]
      const els = objects.filter(({className}) => className === `chart-basic-${sublayer}`)
      COMMON_EVENTS.forEach((type) =>
        els.forEach((el) => el.on(type, this.backupEvent.common[type][sublayer]))
      )
    }
  }

  private setTooltip = (sublayer: string) => {
    const {engine} = this.selector

    if (this.tooltipTargets.indexOf(sublayer) !== -1) {
      if (engine === 'svg' && isSvgContainer(this.root)) {
        const els = this.root.selectAll(`.chart-basic-${sublayer}`)
        TOOLTIP_EVENTS.forEach((type) => els.on(`${type}.tooltip`, this.backupEvent.tooltip[type]))
      } else if (engine === 'canvas' && isCanvasContainer(this.root)) {
        const objects = this.root.getObjects() as FabricObject[]
        const els = objects.filter(({className}) => className === `chart-basic-${sublayer}`)
        TOOLTIP_EVENTS.forEach((type) =>
          els.forEach((el) => el.on(type, this.backupEvent.tooltip[type]))
        )
      }
    }
  }

  // register the animation events after render
  private createAnimation = (sublayer: string) => {
    let isFirstPlay = true
    const {engine} = this.options
    const {options} = this.backupAnimation

    // destroy previous animation to free resource
    if (this.backupAnimation[sublayer]) {
      this.backupAnimation[sublayer].destroy()
      isFirstPlay = false
    }

    // no data & config
    if (this.backupData[sublayer].length === 0 || !options || !options[sublayer]) {
      this.backupAnimation[sublayer] = null
      return
    }

    const animationQueue = new AnimationQueue({options: {loop: false}})
    const enterQueue = new AnimationQueue({options: {loop: false}})
    const loopQueue = new AnimationQueue({options: {loop: false}})
    const {enter, loop, update} = options[sublayer]
    const targets = `.chart-basic-${sublayer}`

    // create enter & loop animation and connect them
    isFirstPlay && animationQueue.push('queue', enterQueue, this.root)
    isFirstPlay && enter && enterQueue.push(enter.type, {...enter, targets, engine}, this.root)
    loop && loopQueue.push(loop.type, {...loop, targets, engine}, this.root)
    this.backupAnimation[sublayer] = animationQueue.push('queue', loopQueue, this.root)
    // register the animation events
    this.backupAnimation[sublayer].event.on('start', (d: any) =>
      this.event.fire(`${sublayer}-animation-start`, d)
    )
    this.backupAnimation[sublayer].event.on('process', (d: any) =>
      this.event.fire(`${sublayer}-animation-process`, d)
    )
    this.backupAnimation[sublayer].event.on('end', (d: any) =>
      this.event.fire(`${sublayer}-animation-end`, d)
    )

    // restart the loop animation after the update animation
    if (!isFirstPlay) {
      clearTimeout(this.backupAnimation[sublayer].timer)
      const {duration = 2000, delay = 0} = update || {}
      const timer = setTimeout(() => this.backupAnimation[sublayer].play(), duration + delay)
      this.backupAnimation[sublayer].timer = timer
    }
  }

  // universal draw function
  protected drawBasic = ({type, data, sublayer = type}: DrawBasicProps) => {
    const {selector} = this
    const {engine} = selector
    const sublayerClassName = `${this.className}-${sublayer}`
    let sublayerContainer = selector.getFirstChildByClassName(this.root, sublayerClassName)

    // sublayer container preparation
    if (!sublayerContainer) {
      sublayerContainer = selector.createSubContainer(this.root, sublayerClassName)
    }

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

    // start analysis data
    for (let i = 0; i < data.length; i++) {
      this.backupData[sublayer].length = data.length
      if (!isEqual(this.backupData[sublayer][i], data[i])) {
        const groupClassName = `${sublayerClassName}-${i}`
        const groupContainer = selector.getFirstChildByClassName(sublayerContainer, groupClassName)
        const options: GraphDrawerProps<any> = {
          engine,
          className: `chart-basic-${sublayer}`,
          container: groupContainer!,
          data: [],
        }

        !data[i].hide && merge(options, data[i])
        // first play will close the update animation
        options.enableUpdateAnimation = false
        if (this.backupData[sublayer][i] && this.backupAnimation.options[sublayer]) {
          const {duration, delay} = this.backupAnimation.options[sublayer].update || {}
          options.enableUpdateAnimation = true
          options.updateAnimationDuration = duration
          options.updateAnimationDelay = delay
        }
        // draw basic elements using draw functions
        drawerMapping[type](options)
        // backup data
        this.backupData[sublayer][i] = data[i]
      }
    }

    // new elements need to register events
    this.setEvent(sublayer)
    this.setTooltip(sublayer)
    this.selector.engine === 'svg' && this.createAnimation(sublayer)
  }

  destroy() {
    this.sublayers.forEach((name) => this.backupAnimation[name]?.destroy())
    this.root && this.selector.remove(this.root)
  }
}
