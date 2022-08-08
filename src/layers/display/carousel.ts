import {isNil, max, min} from 'lodash'
import {LayerBase} from '../base'
import {createStyle, validateAndCreateData} from '../helpers'
import {DataTableList} from '../../data'
import {
  ChartContext,
  DrawerDataShape,
  ImageDrawerProps,
  LayerCarouselOptions,
  LayerCarouselStyleShape,
} from '../../types'

const defaultOptions: Partial<LayerCarouselOptions> = {
  mode: 'slide',
}

const defaultStyle: LayerCarouselStyleShape = {
  direction: 'left',
  padding: 10,
  zoom: 0.7,
  interval: 2000,
}

export class LayerCarousel extends LayerBase<LayerCarouselOptions> {
  private _data: Maybe<DataTableList>

  private _style = defaultStyle

  private carouselData: Required<
    DrawerDataShape<ImageDrawerProps> & {
      carouselIndex: number
      opacity: number
    }
  >[] = []

  private timer: Maybe<NodeJS.Timeout>

  private currentIndex = 0

  get data() {
    return this._data
  }

  get style() {
    return this._style
  }

  constructor(options: LayerCarouselOptions, context: ChartContext) {
    super({
      context,
      options: {...defaultOptions, ...options},
      sublayers: ['carousel', 'text'],
    })
  }

  setData(data: LayerCarousel['data']) {
    this._data = validateAndCreateData('tableList', this.data, data)

    const {mode, layout} = this.options,
      {rawTableList = []} = this.data!,
      {width, height, left, top} = layout,
      prefix = [...rawTableList, ...rawTableList].slice(-2),
      suffix = [...rawTableList, ...rawTableList].slice(0, 2),
      total = [...prefix, ...rawTableList, ...suffix]

    this.currentIndex = Math.floor(total.length / 2)

    if (mode === 'slide') {
      this.carouselData = total.map(([url], i) => ({
        url,
        carouselIndex: i,
        opacity: Math.abs(i - this.currentIndex) > 1 ? 0 : 1,
      })) as LayerCarousel['carouselData']
    } else if (mode === 'fade') {
      this.carouselData = total.map(([url], i) => ({
        url: url as string,
        carouselIndex: i,
        opacity: i === this.currentIndex ? 1 : 0,
        width,
        height,
        x: left,
        y: top,
      }))
    }
  }

  setScale() {}

  setStyle(style: LayerCarouselStyleShape) {
    this._style = createStyle(defaultStyle, this._style, style)
  }

  update() {
    if (!this.data) {
      throw new Error('Invalid data')
    }

    const {mode, layout} = this.options,
      {padding = 0, zoom = 1, direction} = this.style,
      {left, top, width, height, right, bottom} = layout

    if (mode === 'slide') {
      if (direction === 'left' || direction === 'right') {
        const groupWidth = width * zoom + padding

        this.carouselData = this.carouselData.map(({carouselIndex, ...rest}) => ({
          ...rest,
          carouselIndex,
          width: carouselIndex === this.currentIndex ? width : width * zoom,
          height: carouselIndex === this.currentIndex ? height : height * zoom,
          y: carouselIndex === this.currentIndex ? top : top + (height * (1 - zoom)) / 2,
          x:
            this.currentIndex - carouselIndex > 0
              ? left - (this.currentIndex - carouselIndex) * groupWidth
              : this.currentIndex - carouselIndex < 0
              ? right + (carouselIndex - this.currentIndex) * groupWidth - width * zoom
              : left,
        }))
      } else if (direction === 'top' || direction === 'bottom') {
        const groupHeight = height * zoom + padding

        this.carouselData = this.carouselData.map(({carouselIndex, ...rest}) => ({
          ...rest,
          carouselIndex,
          width: carouselIndex === this.currentIndex ? width : width * zoom,
          height: carouselIndex === this.currentIndex ? height : height * zoom,
          x: carouselIndex === this.currentIndex ? left : left + (width * (1 - zoom)) / 2,
          y:
            this.currentIndex - carouselIndex > 0
              ? top - (this.currentIndex - carouselIndex) * groupHeight
              : this.currentIndex - carouselIndex < 0
              ? bottom + (carouselIndex - this.currentIndex) * groupHeight - height * zoom
              : top,
        }))
      }
    }

    if (mode === 'fade') {
      this.carouselData = this.carouselData.map(({carouselIndex, ...rest}) => ({
        ...rest,
        carouselIndex,
        opacity: carouselIndex === this.currentIndex ? 1 : 0,
      }))
    }
  }

  next() {
    const {mode} = this.options,
      {direction} = this.style,
      _min = min(this.carouselData.map(({carouselIndex}) => carouselIndex)),
      _max = max(this.carouselData.map(({carouselIndex}) => carouselIndex)),
      minIndex = this.carouselData.findIndex((item) => item.carouselIndex === _min),
      maxIndex = this.carouselData.findIndex((item) => item.carouselIndex === _max)

    if (mode === 'slide') {
      if (direction === 'left' || direction === 'top') {
        this.currentIndex++
        this.carouselData[minIndex].carouselIndex = (_max ?? 0) + 1
        this.carouselData.forEach(({carouselIndex}, i) => {
          this.carouselData[i].opacity = Math.abs(carouselIndex - this.currentIndex) > 1 ? 0 : 1
        })
      } else if (direction === 'right' || direction === 'bottom') {
        this.currentIndex--
        this.carouselData[maxIndex].carouselIndex = (_min ?? 0) - 1
        this.carouselData.forEach(({carouselIndex}, i) => {
          this.carouselData[i].opacity = Math.abs(carouselIndex - this.currentIndex) > 1 ? 0 : 1
        })
      }
    } else if (mode === 'fade') {
      this.currentIndex++
      this.carouselData[minIndex].carouselIndex = (_max ?? 0) + 1
    }

    this.needRecalculated = true
    this.draw()
  }

  draw() {
    const carouselData = {
      data: this.carouselData,
      opacity: this.carouselData.map(({opacity}) => opacity),
    }

    this.drawBasic({type: 'image', data: [carouselData], sublayer: 'carousel'})

    !isNil(this.timer) && clearTimeout(this.timer)
    this.timer = setTimeout(this.next.bind(this), this.style.interval)
  }
}
