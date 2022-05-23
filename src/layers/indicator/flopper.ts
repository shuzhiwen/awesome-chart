import anime from 'animejs'
import {select} from 'd3'
import {cloneDeep, merge} from 'lodash'
import {LayerBase} from '../base'
import {DataBase} from '../../data'
import {createStyle, validateAndCreateData} from '../helpers'
import {
  addStyle,
  isCanvasContainer,
  isSvgContainer,
  mergeAlpha,
  range,
  safeTransform,
} from '../../utils'
import {
  BasicAnimationOptions,
  ChartContext,
  D3Selection,
  LayerFlopperOptions,
  LayerFlopperStyleShape,
} from '../../types'

const defaultOptions: Partial<LayerFlopperOptions> = {
  variant: 'vertical',
}

const defaultStyle: LayerFlopperStyleShape = {
  scale: 0.5,
  integerPlace: 8,
  decimalPlace: 2,
  thousandth: true,
  cell: {
    fontSize: '48px',
    backgroundColor: 'black',
  },
}

const defaultAnimation: BasicAnimationOptions = {
  delay: 0,
  duration: 2000,
  easing: 'easeOutSine',
}

const characterSet = ['', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', ',', '.']

export class LayerFlopper extends LayerBase<LayerFlopperOptions> {
  private _data: Maybe<DataBase<{value: number}>>

  private _style = defaultStyle

  private magnitudes: Record<number, string> = {}

  private cellSize: {width: number; height: number} = {width: 0, height: 0}

  private cellData: {text: string; prevText?: string}[] = []

  private animation = defaultAnimation

  get data() {
    return this._data
  }

  get style() {
    return this._style
  }

  constructor(options: LayerFlopperOptions, context: ChartContext) {
    super({options: {...defaultOptions, ...options}, context})

    const {containerWidth, containerHeight, layout, root, autoplay} = this.options,
      {left, top, width, height} = layout

    if (isSvgContainer(root)) {
      this.root = root
        .append('foreignObject')
        .style('width', containerWidth)
        .style('height', containerHeight)
        .append('xhtml:div')
        .attr('class', `${this.className}-container`)
        .style('width', `${width}px`)
        .style('height', `${height}px`)
        .style('margin-left', `${left}px`)
        .style('margin-top', `${top}px`)
        .style('display', 'flex')
        .style('flex-direction', 'row')
        .style('overflow', 'hidden')
    }

    if (autoplay) {
      const random = () => {
        const {integerPlace = 8} = this.style,
          {duration = 0} = this.animation

        setTimeout(() => {
          this.setData(new DataBase({value: Math.random() * 10 ** (integerPlace ?? 8)}))
          this.draw()
          this.playAnimation()
          this.log.info('Random Number', this.data?.source.value)
          random()
        }, duration + 2000)
      }
      random()
    }
  }

  setData(data: LayerFlopper['data']) {
    this._data = validateAndCreateData('base', this.data, data)
    this.magnitudes = {}

    const {value} = this.data?.source ?? {},
      [integer, decimal] = String(value).split('.')

    for (let i = 0; integer && i < integer.length; i++) {
      this.magnitudes[integer.length - (i + 1)] = integer[i]
    }
    for (let i = 0; decimal && i < decimal.length; i++) {
      this.magnitudes[-(i + 1)] = decimal[i]
    }
  }

  setScale() {}

  setStyle(style: LayerFlopperStyleShape) {
    this._style = createStyle(defaultStyle, this.style, style)
  }

  update() {
    const {width, height} = this.options.layout,
      {integerPlace = 8, decimalPlace = 2, thousandth} = this.style,
      commaPlace = thousandth ? Math.floor(Math.abs(integerPlace - 1) / 3) : 0,
      places = integerPlace + decimalPlace + commaPlace + (decimalPlace > 0 ? 1 : 0),
      prevData = this.cellData.map(({text}) => text)

    this.cellSize = {width: width / places, height}
    this.cellData = []

    range(integerPlace + commaPlace - 1, -decimalPlace, -1).forEach((index) => {
      const text =
        thousandth && index >= 0
          ? (index + 1) % 4 !== 0
            ? this.magnitudes[index - Math.floor(Math.abs(index - 1) / 3)]
            : ','
          : this.magnitudes[index]

      this.cellData.push({text, prevText: prevData.shift()})
      if (index === 0 && decimalPlace > 0) {
        this.cellData.push({text: '.', prevText: prevData.shift()})
      }
    })

    const findNumber = (data: LayerFlopper['cellData']) =>
        data.findIndex(({text}) => text >= '0' && text <= '9'),
      firstNumber = findNumber(this.cellData),
      lastNumber = this.cellData.length - findNumber(cloneDeep(this.cellData).reverse()) - 1

    this.cellData.forEach((item, i) => (i < firstNumber || i > lastNumber) && (item.text = ''))
  }

  draw() {
    if (isCanvasContainer(this.root)) {
      this.log.error('Not support canvas flopper')
      return
    }

    const {variant} = this.options,
      {url, characters, scale, cell} = this.style,
      {backgroundColor} = cell || {},
      {width, height} = this.cellSize,
      characterData = variant === 'flop' ? cloneDeep(characterSet).reverse() : characterSet,
      position = variant === 'flop' ? 'absolute' : 'relative',
      background = mergeAlpha(backgroundColor || 'black', 1)

    this.root
      .style('background', background)
      .selectAll(`.${this.className}-group`)
      .data(this.cellData)
      .join('xhtml:div')
      .attr('class', `${this.className}-group`)
      .style('width', `${width}px`)
      .style('height', `${height}px`)
      .selectAll(`.${this.className}-cell`)
      .data(characterData)
      .join('xhtml:div')
      .attr('class', `${this.className}-cell`)
      .style('width', `${width}px`)
      .style('height', `${height}px`)
      .style('position', position)
      .each((d, i, els) => {
        const container = addStyle(select(els[i]), cell)

        if (variant === 'vertical') {
          if (characters?.[d]) {
            const {left, top, width, height} = characters[d],
              [offsetX, offsetY] = [-width / 2 - left, -height / 2 - top]
            container
              .style('transform', `scale(${scale})`)
              .selectAll('img')
              .data([null])
              .join('img')
              .attr('src', url!)
              .style('position', 'absolute')
              .style('clip', `rect(${top}px,${left + width}px,${top + height}px,${left}px)`)
              .style('transform', `translate(${offsetX}px,${offsetY}px)`)
              .style('left', '50%')
              .style('top', '50%')
          } else {
            container.text(d).style('display', 'grid').style('place-items', 'center')
          }
        } else if (variant === 'flop') {
          container
            .selectAll('.top')
            .data([null])
            .join('xhtml:div')
            .attr('class', 'digital top')
            .style('transform-origin', '50% 100%')
            .style('top', 0)
            .style('bottom', '50%')
            .style('align-items', 'end')
            .style('z-index', (_, __, elements) => {
              const zIndex = select(elements[0]).style('z-index')
              return zIndex === 'auto' ? -characterSet.length + i : zIndex
            })
          container
            .selectAll('.bottom')
            .data([null])
            .join('xhtml:div')
            .attr('class', 'digital bottom')
            .style('transform-origin', '50% 0%')
            .style('top', '50%')
            .style('bottom', 0)
            .style('z-index', (_, __, elements) => {
              const zIndex = select(elements[0]).style('z-index')
              return zIndex === 'auto' ? -characterSet.length + i : zIndex
            })
          container
            .selectAll('.digital')
            .style('position', 'absolute')
            .style('left', 0)
            .style('right', 0)
            .style('line-height', 0)
            .style('display', 'flex')
            .style('justify-content', 'center')
            .style('backface-visibility', 'hidden')
            .style('overflow', 'hidden')
          if (characters?.[d]) {
            const {left, top, width, height} = characters[d],
              [offsetX, offsetY] = [-width / 2 - left, -height / 2 - top]
            container
              .selectAll('.digital')
              .style('transform', `scale(${scale})`)
              .selectAll('img')
              .data([null])
              .join('img')
              .attr('src', url!)
              .style('left', '50%')
              .style('position', 'absolute')
              .style('backface-visibility', 'hidden')
              .style('clip', `rect(${top}px,${left + width}px,${top + height}px,${left}px)`)
              .style('transform', `translate(${offsetX}px,${offsetY}px)`)
              .style('background', background)
            container.selectAll('.top img').style('top', '100%')
          } else {
            container.selectAll('.digital').text(d).style('background', background)
          }
        }
      })
  }

  setAnimation(options: BasicAnimationOptions) {
    merge(this.animation, options)
  }

  playAnimation() {
    if (isCanvasContainer(this.root)) {
      this.log.error('Not support canvas flopper')
      return
    }

    const {variant} = this.options,
      {duration = 2000, delay = 0, easing = 'easeOutCubic'} = this.animation

    this.root.selectAll(`.${this.className}-group`).each((d, i, els) => {
      let prevIndex = characterSet.findIndex((value) => value === (d as any).prevText),
        index = characterSet.findIndex((value) => value === (d as any).text)

      prevIndex = prevIndex === -1 ? 0 : prevIndex
      index = index === -1 ? 0 : index

      if (index !== prevIndex && variant === 'vertical') {
        anime({
          targets: select(els[i]).nodes(),
          duration,
          delay,
          easing,
          translateY: `+=${this.cellSize.height * (prevIndex - index)}`,
        })
      } else if (index !== prevIndex) {
        const cells = select(els[i]).selectAll(`.${this.className}-cell`).nodes().reverse(),
          [backCell, frontCell] = [cells[index], cells[prevIndex]],
          backTop = select(backCell).selectAll('.top'),
          backBottom = select(backCell).selectAll('.bottom'),
          frontTop = select(frontCell).selectAll('.top'),
          frontBottom = select(frontCell).selectAll('.bottom'),
          getTransform = (selector: D3Selection, rotateX: number) =>
            safeTransform(selector.style('transform'), 'rotateX', rotateX, {unit: true})

        backTop.style('z-index', 1)
        backBottom.style('z-index', 2)
        frontTop.style('z-index', 3)
        frontBottom.style('z-index', 1)

        backBottom.style('transform', getTransform(backBottom, 180))
        anime({targets: backBottom.nodes(), rotateX: 0, duration, easing})
        anime({targets: frontTop.nodes(), rotateX: 180, duration, easing}).finished.then(() => {
          frontTop.style('z-index', 'auto').style('transform', getTransform(frontTop, 0))
          frontBottom.style('z-index', 'auto')
        })
      }
    })
  }
}
