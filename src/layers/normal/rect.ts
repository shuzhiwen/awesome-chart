import {LayerBase} from '../base'
import {DataTableList} from '../../data'
import {scaleBand, scaleLinear} from '../../scales'
import {ColorMatrix, formatNumber, isRealNumber, transpose} from '../../utils'
import {cloneDeep, isArray} from 'lodash'
import {
  createColorMatrix,
  createScale,
  createStyle,
  createText,
  validateAndCreateData,
} from '../helpers'
import {
  ChartContext,
  DrawerDataShape,
  LayerLineScaleShape,
  LayerOptions,
  LayerRectOptions,
  LayerRectScaleShape,
  LayerRectStyleShape,
  LegendDataShape,
  ScaleBand,
  ScaleLinear,
  TextDrawerProps,
} from '../../types'

const defaultOptions: Partial<LayerRectOptions> = {
  variant: 'column',
  mode: 'cover',
}

const defaultStyle: LayerRectStyleShape = {
  fixedWidth: null,
  fixedHeight: null,
  labelPosition: 'center',
  labelPositionOrient: 'outer',
  background: {
    fillOpacity: 0.3,
  },
  text: {
    offset: [0, 0],
  },
}

export class LayerRect extends LayerBase<LayerRectOptions> {
  public legendData: LegendDataShape = {}

  private _data: Maybe<DataTableList>

  private _scale: LayerRectScaleShape

  private _style = defaultStyle

  private textData: DrawerDataShape<TextDrawerProps>[][] = []

  private rectData: {
    x: number
    y: number
    width: number
    height: number
    value: Meta
    source: AnyObject
    color: string
  }[][] = []

  private backgroundData: {
    x: number
    y: number
    width: number
    height: number
  }[][] = []

  get scale() {
    return this._scale!
  }

  get data() {
    return this._data!
  }

  get style() {
    return this._style!
  }

  constructor(options: LayerOptions, context: ChartContext) {
    super({
      context,
      options: {...defaultOptions, ...options},
      sublayers: ['text', 'rect', 'background'],
      tooltipTargets: ['rect'],
    })
  }

  setData(data: LayerRect['data']) {
    this._data = validateAndCreateData('base', this.data, data)
  }

  setScale(scale: LayerLineScaleShape) {
    this._scale = createScale(undefined, this.scale, scale)
  }

  setStyle(style: LayerRectStyleShape) {
    this._style = createStyle(defaultStyle, this.style, style)
  }

  update() {
    this.createScale()

    const {variant, mode, layout} = this.options,
      {rect} = this.style,
      pureTableList = transpose(this.data.data.map(({list}) => list)),
      headers = this.data.data.map(({header}) => header)
    let colorMatrix: ColorMatrix

    if (variant === 'column') {
      const scaleX = this.scale.scaleX as ScaleBand,
        scaleY = this.scale.scaleY as ScaleLinear

      this.rectData = pureTableList.map(([dimension, ...values]) =>
        values.map((value, i) => ({
          value,
          x: layout.left + (scaleX(dimension as string) || 0),
          y: layout.top + (value > 0 ? scaleY(value as number) : scaleY(0)),
          width: scaleX.bandwidth(),
          height: Math.abs(scaleY(value as number) - scaleY(0)),
          source: {dimension, category: headers[i + 1], value},
          color: '#000',
        }))
      )
      this.backgroundData = pureTableList.map(([dimension]) => [
        {
          x: layout.left + (scaleX(dimension as string) || 0),
          y: layout.top,
          width: scaleX.bandwidth(),
          height: layout.height,
        },
      ])
    } else if (variant === 'bar') {
      const scaleX = this.scale.scaleX as ScaleLinear,
        scaleY = this.scale.scaleY as ScaleBand

      this.rectData = pureTableList.map(([dimension, ...values]) =>
        values.map((value, i) => ({
          value,
          y: layout.top + (scaleY(dimension as string) || 0),
          x: layout.left + (value < 0 ? scaleX(value as number) : scaleX(0)),
          width: Math.abs(scaleX(value as number) - scaleX(0)),
          height: scaleY.bandwidth(),
          source: {dimension, category: headers[i + 1], value},
          color: '#000',
        }))
      )
      this.backgroundData = pureTableList.map(([dimension]) => [
        {
          x: layout.left,
          y: layout.top + (scaleY(dimension as string) || 0),
          width: layout.width,
          height: scaleY.bandwidth(),
        },
      ])
    }

    this.rectData = this.rectData.map((group) => group.filter(({value}) => isRealNumber(value)))

    if (this.rectData[0]?.length > 1) {
      colorMatrix = createColorMatrix({
        layer: this,
        row: 1,
        column: this.rectData[0].length,
        theme: rect?.fill,
      })
      this.rectData.forEach((group) =>
        group.forEach((item, i) => (item.color = colorMatrix.get(0, i)))
      )
    } else {
      colorMatrix = createColorMatrix({
        layer: this,
        row: this.rectData.length,
        column: 1,
        theme: rect?.fill,
      })
      this.rectData.forEach((group, i) => (group[0].color = colorMatrix.get(i, 0)))
    }

    if (mode === 'group') {
      this.transformGroup()
    } else if (mode === 'stack') {
      this.transformStack()
    } else if (mode === 'interval') {
      this.transformInterval()
    } else if (mode === 'percentage') {
      this.transformPercentage()
    } else if (mode === 'waterfall') {
      this.transformWaterfall()
    }

    this.createRectLabel()
    this.transformFixed()

    if (mode !== 'interval' && mode !== 'waterfall') {
      this.legendData = {
        colorMatrix,
        filter: 'column',
        legends: this.data.data.slice(1).map(({header}, i) => ({
          shape: 'rect',
          label: header,
          color: colorMatrix.get(0, i),
        })),
      }
    }
  }

  private transformGroup() {
    const {variant} = this.options,
      columnNumber = this.rectData[0].length

    if (variant === 'column') {
      this.rectData.forEach((group) => {
        group.forEach((item, i) => {
          item.width /= columnNumber
          i !== 0 && (item.x = group[i - 1].x + group[i - 1].width)
        })
      })
    } else if (variant === 'bar') {
      this.rectData.forEach((group) => {
        group.forEach((item, i) => {
          item.height /= columnNumber
          i !== 0 && (item.y = group[i - 1].y + group[i - 1].height)
        })
      })
    }
  }

  private transformStack() {
    const {variant} = this.options

    if (variant === 'column') {
      this.rectData.forEach((group) => {
        group.forEach((item, i) => {
          i !== 0 && (item.y = group[i - 1].y - item.height)
        })
      })
    } else if (variant === 'bar') {
      this.rectData.forEach((group) => {
        group.forEach((item, i) => {
          i !== 0 && (item.x = group[i - 1].x + group[i - 1].width)
        })
      })
    }
  }

  private transformInterval() {
    const {variant} = this.options

    this.rectData = this.rectData.map((group) => {
      const [data1, data2] = [group[0], group[1]],
        min = Math.min(Number(data1.value), Number(data2.value)),
        max = Math.max(Number(data1.value), Number(data2.value))

      if (variant === 'column') {
        return [
          {
            ...data1,
            value: max - min,
            y: Math.min(data1.y, data2.y),
            height: Math.abs(data1.y - data2.y),
            source: group.map(({source}) => source),
          },
        ]
      } else if (variant === 'bar') {
        return [
          {
            ...data1,
            value: max - min,
            x: Math.min(data1.x + data1.width, data2.x + data2.width),
            width: Math.abs(data1.x + data1.width - data2.x - data2.width),
            source: group.map(({source}) => source),
          },
        ]
      }

      return group
    })
  }

  private transformWaterfall() {
    const {variant} = this.options

    if (variant === 'column') {
      this.rectData.forEach((group, i) => {
        group.forEach((item) => {
          i !== 0 && (item.y = this.rectData[i - 1][0].y - item.height)
        })
      })
      const {y, height} = this.rectData[this.rectData.length - 1][0]
      this.rectData[this.rectData.length - 1][0].y = y + height
    } else if (variant === 'bar') {
      this.rectData.forEach((group, i) => {
        group.forEach((item) => {
          i !== 0 && (item.x = this.rectData[i - 1][0].x + this.rectData[i - 1][0].width)
        })
      })
      const {x, width} = this.rectData[this.rectData.length - 1][0]
      this.rectData[this.rectData.length - 1][0].x = x - width
    }
  }

  private transformPercentage() {
    const {variant, layout} = this.options,
      {width, height} = layout

    this.rectData.forEach((group) => {
      const total = group.reduce((prev, cur) => prev + Number(cur.value), 0),
        percentages = group.map(({value}) => Number(value) / total)

      group.map((item, i) => {
        item.value = formatNumber(percentages[i], {decimals: 4})
        if (variant === 'column') {
          item.y = item.y + item.height - height * percentages[i]
          item.height = height * percentages[i]
        } else if (variant === 'bar') {
          item.width = width * percentages[i]
        }
      })
    })

    this.transformStack()
  }

  private transformFixed() {
    const {variant} = this.options,
      {fixedWidth, fixedHeight} = this.style

    this.rectData = this.rectData.map((group) => {
      return group.map(({x, y, width, height, ...rest}) => {
        if (variant === 'column') {
          return {
            ...rest,
            x: fixedWidth ? x + (width - fixedWidth) / 2 : x,
            y: fixedHeight && rest.value < 0 ? y + height - fixedHeight : y,
            width: fixedWidth ?? width,
            height: fixedHeight ?? height,
          }
        } else {
          return {
            ...rest,
            x: fixedWidth && rest.value > 0 ? x + width - fixedWidth : x,
            y: fixedHeight ? y + (height - fixedHeight) / 2 : y,
            width: fixedWidth ?? width,
            height: fixedHeight ?? height,
          }
        }
      })
    })
  }

  private createScale() {
    const {layout, variant = 'column', mode} = this.options,
      {width, height} = layout,
      headers = this.data.data.map(({header}) => header),
      selectMode = mode === 'stack' ? 'sum' : 'copy',
      bandDomain = this.data.select(headers[0]).data[0].list as string[],
      linearDomain =
        mode !== 'percentage'
          ? this.data.select(headers.slice(1), {mode: selectMode}).range()
          : ([0, 1] as [number, number])

    if (variant === 'column') {
      this._scale = createScale(
        {
          scaleX: scaleBand({
            domain: bandDomain,
            range: [0, width],
          }),
          scaleY: scaleLinear({
            domain: linearDomain,
            range: [height, 0],
          }),
        },
        this.scale
      )
    } else if (variant === 'bar') {
      this._scale = createScale(
        {
          scaleX: scaleLinear({
            domain: linearDomain,
            range: [0, width],
          }),
          scaleY: scaleBand({
            domain: bandDomain,
            range: [0, height],
          }),
        },
        this.scale
      )
    }
  }

  private createRectLabel() {
    const {variant = 'column'} = this.options,
      {labelPosition, labelPositionOrient, text: originText} = this.style,
      positionMin = isArray(labelPosition) ? labelPosition[0] : labelPosition,
      positionMax = isArray(labelPosition) ? labelPosition[1] : labelPosition

    this.textData = this.rectData.map((group) =>
      group.map(({value, x, y, width, height}) => {
        const text = cloneDeep(originText)!,
          [offsetX = 0, offsetY = 0] = text.offset!,
          labelPosition = value > 0 ? positionMax : positionMin
        let position: Position9 = 'center',
          positionX = x,
          positionY = y

        if (value < 0) {
          text.offset = [
            variant === 'column' ? offsetX : -offsetX,
            variant === 'bar' ? offsetY : -offsetY,
          ]
        }

        if (labelPosition === 'top') {
          positionX = x + width / 2
          position = labelPositionOrient === 'inner' ? 'bottom' : 'top'
        } else if (labelPosition === 'bottom') {
          positionX = x + width / 2
          positionY = y + height
          position = labelPositionOrient === 'inner' ? 'top' : 'bottom'
        } else if (labelPosition === 'left') {
          positionY = y + height / 2
          position = labelPositionOrient === 'inner' ? 'right' : 'left'
        } else if (labelPosition === 'right') {
          positionX = x + width
          positionY = y + height / 2
          position = labelPositionOrient === 'inner' ? 'left' : 'right'
        } else if (labelPosition === 'center') {
          positionX = x + width / 2
          positionY = y + height / 2
        }

        return createText({x: positionX, y: positionY, position, value, style: text})
      })
    )
  }

  draw() {
    const {variant} = this.options
    const rectData = this.rectData.map((group) => ({
      data: group,
      source: group.map((item) => item.source),
      transformOrigin: variant === 'column' ? 'bottom' : 'left',
      ...this.style.rect,
      fill: group.map(({color}) => color),
    }))
    const background = this.backgroundData.map((group) => ({
      data: group,
      ...this.style.background,
    }))
    const textData = this.textData.map((group) => ({
      data: group,
      ...this.style.text,
    }))

    this.drawBasic({type: 'rect', data: background, sublayer: 'background'})
    this.drawBasic({type: 'rect', data: rectData})
    this.drawBasic({type: 'text', data: textData})
  }
}
