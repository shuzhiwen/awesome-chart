import anime from 'animejs'
import {select} from 'd3'
import {cloneDeep, merge} from 'lodash'
import {lightTheme} from '../../core/theme'
import {DataBase} from '../../data'
import {
  ChartContext,
  LayerAnimation,
  LayerFlopperOptions,
  LayerFlopperStyle,
  LayerStyle,
} from '../../types'
import {addStyle, isCC, isSC, mergeAlpha, robustRange} from '../../utils'
import {LayerBase} from '../base'
import {createStyle, validateAndCreateData} from '../helpers'

const defaultOptions: Partial<LayerFlopperOptions> = {
  variant: 'vertical',
}

const defaultStyle: LayerFlopperStyle = {
  scale: 1,
  integers: 8,
  decimals: 2,
  thousandth: true,
}

const characterSet = ['', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', ',', '.']

export class LayerFlopper extends LayerBase<LayerFlopperOptions, never> {
  private _data: Maybe<DataBase<{value: number}>>

  private _style = defaultStyle

  private magnitudes: Record<number, string> = {}

  private cellSize: {width: number; height: number} = {width: 0, height: 0}

  private cellData: {text: string; prevText?: string}[] = []

  private animation = {...lightTheme.animation.update}

  get data() {
    return this._data
  }

  get style() {
    return this._style
  }

  constructor(options: LayerFlopperOptions, context: ChartContext) {
    super({options: {...defaultOptions, ...options}, context})

    const {containerWidth, containerHeight, layout, root} = this.options,
      {left, top, width, height} = layout

    if (isSC(root)) {
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

  setStyle(style: LayerStyle<LayerFlopperStyle>) {
    this._style = createStyle(this.options, defaultStyle, this.style, style)
  }

  update() {
    const {width, height} = this.options.layout,
      {integers = 8, decimals = 2, thousandth} = this.style,
      commas = thousandth ? Math.floor(Math.abs(integers - 1) / 3) : 0,
      places = integers + decimals + commas + (decimals > 0 ? 1 : 0),
      prevData = this.cellData.map(({text}) => text)

    this.cellSize = {width: width / places, height}
    this.cellData = []

    robustRange(integers + commas - 1, -decimals, -1).forEach((index) => {
      const text =
        thousandth && index >= 0
          ? (index + 1) % 4 !== 0
            ? this.magnitudes[index - Math.floor(Math.abs(index - 1) / 3)]
            : ','
          : this.magnitudes[index]

      this.cellData.push({text, prevText: prevData.shift()})
      if (index === 0 && decimals > 0) {
        this.cellData.push({text: '.', prevText: prevData.shift()})
      }
    })

    const findNumber = (data: LayerFlopper['cellData']) =>
      data.findIndex(({text}) => text >= '0' && text <= '9')
    const first = findNumber(this.cellData)
    const last = this.cellData.length - findNumber(cloneDeep(this.cellData).reverse()) - 1

    this.cellData.forEach((item, i) => {
      if (i < first || i > last) item.text = ''
    })
  }

  draw() {
    if (isCC(this.root)) {
      throw new Error('Not support canvas flopper')
    }

    const {variant} = this.options,
      {width, height} = this.cellSize,
      {url, characters, scale, cell} = this.style,
      background = cell?.backgroundColor || 'green',
      data = variant === 'flop' ? cloneDeep(characterSet).reverse() : characterSet,
      position = variant === 'flop' ? 'absolute' : 'relative'

    this.root
      .style('background', mergeAlpha(background, 1))
      .selectAll(`.${this.className}-group`)
      .data(this.cellData)
      .join('xhtml:div')
      .attr('class', `${this.className}-group`)
      .style('width', `${width}px`)
      .style('height', `${height}px`)
      .selectAll(`.${this.className}-cell`)
      .data(data)
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

  setAnimation(options: Maybe<LayerAnimation<Partial<LayerFlopper['animation']>>>) {
    const {update} = this.options.theme.animation
    this.animation = merge({}, update, this.animation, options)
  }

  playAnimation() {
    if (isCC(this.root)) {
      throw new Error('Not support canvas flopper')
    }

    const {variant, theme} = this.options
    const {
      duration = theme.animation.update.duration,
      delay = theme.animation.update.delay,
      easing = theme.animation.update.easing,
    } = this.animation

    this.root.selectAll(`.${this.className}-group`).each((d, i, els) => {
      let prevIndex = characterSet.indexOf((d as any).prevText),
        index = characterSet.indexOf((d as any).text)

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
          frontBottom = select(frontCell).selectAll('.bottom')

        backTop.style('z-index', 1)
        backBottom.style('z-index', 2)
        frontTop.style('z-index', 3)
        frontBottom.style('z-index', 1)

        anime({targets: backBottom.nodes(), rotateX: 180, duration: 0})
        anime({targets: backBottom.nodes(), rotateX: 0, duration, easing})
        anime({targets: frontTop.nodes(), rotateX: 180, duration, easing}).finished.then(() => {
          anime({targets: frontTop.nodes(), rotateX: 0, duration: 0})
          frontTop.style('z-index', 'auto')
          frontBottom.style('z-index', 'auto')
        })
      }
    })
  }
}
