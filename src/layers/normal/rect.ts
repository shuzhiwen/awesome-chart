import {cloneDeep} from 'lodash'
import {DataTableList} from '../../data'
import {scaleBand, scaleLinear} from '../../scales'
import {
  DrawerData,
  LayerOptions,
  LayerRectScale,
  LayerRectStyle,
  LayerStyle,
  LegendData,
  RectDrawerProps,
  ScaleBand,
  ScaleLinear,
  SourceMeta,
  TextDrawerProps,
} from '../../types'
import {
  ColorMatrix,
  errorCatcher,
  formatNumber,
  getAttr,
  getPercentageNumber,
  isRealNumber,
  swap,
} from '../../utils'
import {LayerBase} from '../base'
import {
  createColorMatrix,
  createData,
  createScale,
  createStyle,
  createText,
} from '../helpers'

type Key = 'text' | 'rect' | 'background'

const defaultStyle: LayerRectStyle = {
  sort: 'none',
  mode: 'group',
  variant: 'column',
  labelPosition: 'center',
  labelPositionOrient: 'outer',
  fixedHeight: '100%',
  fixedWidth: '100%',
  background: {
    fillOpacity: 0.1,
  },
  text: {
    offset: [0, 0],
  },
  rect: {},
}

export class LayerRect extends LayerBase<Key> {
  public legendData: Maybe<LegendData>

  private _data: Maybe<DataTableList>

  private _scale: LayerRectScale

  private _style = defaultStyle

  protected textData: (DrawerData<TextDrawerProps> & {
    meta: Pick<SourceMeta, 'dimension'>
  })[][] = []

  protected rectData: (DrawerData<RectDrawerProps> & {
    value: number
    meta: SourceMeta
    color?: string
  })[][] = []

  protected backgroundData: DrawerData<RectDrawerProps>[] = []

  get scale() {
    return this._scale
  }

  get data() {
    return this._data
  }

  get style() {
    return this._style
  }

  constructor(options: LayerOptions) {
    super({
      options,
      sublayers: ['text', 'rect', 'background'],
      interactive: ['rect'],
    })
    this.createScale = errorCatcher(this.createScale.bind(this), () => {
      this.log.warn('Create scale failed')
    })
  }

  setData(data: LayerRect['data']) {
    const {mode, sort} = this.style

    this._data = createData('tableList', this.data, data, (data) => {
      if (!data) return

      if (mode === 'interval') {
        return data.select(data.headers.slice(0, 3))
      } else if (mode === 'waterfall') {
        return data.select(data.headers.slice(0, 2))
      }

      if (sort !== 'none') {
        data.sort({mode: sort, targets: 'groupWeight'})
      }
    })

    this.createScale()
  }

  setScale(scale: LayerRectScale) {
    this._scale = createScale(undefined, this.scale, scale)
  }

  setStyle(style: LayerStyle<LayerRectStyle>) {
    this._style = createStyle(this.options, defaultStyle, this.style, style)
    this.createScale()
  }

  update() {
    if (!this.data || !this.scale) {
      throw new Error('Invalid data or scale')
    }

    const {layout} = this.options,
      {rect, variant, mode} = this.style,
      {rawTableList, headers} = this.data
    let colorMatrix: ColorMatrix

    if (variant === 'column') {
      const scaleX = this.scale.scaleX as ScaleBand
      const scaleY = this.scale.scaleY as ScaleLinear

      this.rectData = rawTableList.map(([dimension, ...values]) =>
        values.map((value, i) => ({
          value: Number(value),
          meta: {dimension, category: headers[i + 1], value},
          x: layout.left + (scaleX(dimension as string) || 0),
          y:
            layout.top +
            ((value as number) > 0 ? scaleY(value as number) : scaleY(0)),
          width: scaleX.bandwidth(),
          height: Math.abs(scaleY(value as number) - scaleY(0)),
          transformOrigin: 'bottom',
        }))
      )
      this.backgroundData = rawTableList.map(([dimension]) => ({
        x: layout.left + (scaleX(dimension as string) || 0),
        y: layout.top,
        width: scaleX.bandwidth(),
        height: layout.height,
      }))
    } else {
      const scaleX = this.scale.scaleX as ScaleLinear
      const scaleY = this.scale.scaleY as ScaleBand

      this.rectData = rawTableList.map(([dimension, ...values]) =>
        values.map((value, i) => ({
          value: Number(value),
          meta: {dimension, category: headers[i + 1], value},
          y: layout.top + (scaleY(dimension as string) || 0),
          x:
            layout.left +
            ((value as number) < 0 ? scaleX(value as number) : scaleX(0)),
          width: Math.abs(scaleX(value as number) - scaleX(0)),
          height: scaleY.bandwidth(),
          transformOrigin: 'left',
        }))
      )
      this.backgroundData = rawTableList.map(([dimension]) => ({
        x: layout.left,
        y: layout.top + (scaleY(dimension as string) || 0),
        width: layout.width,
        height: scaleY.bandwidth(),
      }))
    }

    this.rectData = this.rectData.map((group) => {
      return group.filter(({value}) => isRealNumber(value))
    })

    if (this.rectData[0].length > 1 && mode !== 'interval') {
      colorMatrix = createColorMatrix({
        layer: this,
        row: 1,
        column: this.rectData[0].length,
        theme: rect.fill,
      })
      this.rectData.forEach((group) =>
        group.forEach((item, i) => (item.color = colorMatrix.get(0, i)))
      )
    } else {
      colorMatrix = createColorMatrix({
        layer: this,
        row: this.rectData.length,
        column: 1,
        theme: rect.fill,
      })
      this.rectData.forEach((group, i) =>
        group.forEach((item) => (item.color = colorMatrix.get(i, 0)))
      )
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

    this.sortRectDataInGroup()
    this.transformFixed()
    this.createRectLabel()

    if (mode !== 'interval' && mode !== 'waterfall') {
      this.legendData = {
        colorMatrix,
        filter: 'column',
        legends: headers.slice(1).map((header, i) => ({
          shape: 'rect',
          label: header,
          color: colorMatrix.get(0, i),
        })),
      }
    }
  }

  private sortRectDataInGroup() {
    const {sort, variant} = this.style,
      target = variant === 'column' ? 'x' : 'y'

    this.rectData.map((group) => {
      for (let i = 0; i < group.length && sort; i++) {
        for (let j = i + 1; j < group.length; j++) {
          if (sort === 'asc' && group[i].value > group[j].value) {
            swap(group[i], group[j], target)
            swap(group, group, i, j)
          } else if (sort === 'desc' && group[i].value < group[j].value) {
            swap(group[i], group[j], target)
            swap(group, group, i, j)
          }
        }
      }
    })
  }

  private transformGroup() {
    const {variant} = this.style,
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
    const {variant} = this.style

    if (variant === 'column') {
      this.rectData.forEach((group) => {
        let [top, bottom] = [0, 0]

        group.forEach((item, i) => {
          if (i === 0) {
            top = item.y
            bottom = item.y + item.height
          } else if (item.value < 0) {
            item.y = bottom
            bottom += item.height
          } else {
            item.y = top - item.height
            top = item.y
          }
        })
      })
    } else if (variant === 'bar') {
      this.rectData.forEach((group) => {
        let [left, right] = [0, 0]

        group.forEach((item, i) => {
          if (i === 0) {
            left = item.x
            right = item.x + item.width
          } else if (item.value < 0) {
            item.x = left - item.width
            left = item.x
          } else {
            item.x = right
            right += item.width
          }
        })
      })
    }
  }

  private transformInterval() {
    const {variant} = this.style

    this.rectData = this.rectData.map((group) => {
      const [data1, data2] = [group[0], group[1]],
        min = Math.min(Number(data1.value), Number(data2.value)),
        max = Math.max(Number(data1.value), Number(data2.value)),
        meta = Object.fromEntries(
          group.map(({meta}) => [meta.category, meta.value])
        )

      if (variant === 'column') {
        const y1 = data1.value < 0 ? data1.y + data1.height : data1.y
        const y2 = data2.value < 0 ? data2.y + data2.height : data2.y

        return [
          {
            ...data1,
            value: max - min,
            y: Math.min(y1, y2),
            height: Math.abs(y1 - y2),
            meta: meta as SourceMeta,
          },
        ]
      } else {
        const x1 = data1.value < 0 ? data1.x : data1.x + data1.width
        const x2 = data2.value < 0 ? data2.x : data2.x + data2.width

        return [
          {
            ...data1,
            value: max - min,
            x: Math.min(x1, x2),
            width: Math.abs(x1 - x2),
            meta: meta as SourceMeta,
          },
        ]
      }
    })
  }

  private transformWaterfall() {
    const {variant} = this.style,
      lastGroup = this.rectData[this.rectData.length - 1]

    if (variant === 'column') {
      this.rectData.forEach((group, i) => {
        group.forEach((cur) => {
          if (i === 0) return
          const prev = this.rectData[i - 1][0]
          if (prev.value < 0) {
            cur.y = prev.y + prev.height - (cur.value < 0 ? 0 : cur.height)
          } else {
            cur.y = prev.y - (cur.value < 0 ? 0 : cur.height)
          }
        })
      })
      lastGroup[0].y += lastGroup[0].height
    }

    if (variant === 'bar') {
      this.rectData.forEach((group, i) => {
        group.forEach((cur) => {
          if (i === 0) return
          const prev = this.rectData[i - 1][0]
          if (prev.value < 0) {
            cur.x = prev.x - (cur.value < 0 ? cur.width : 0)
          } else {
            cur.x = prev.x + prev.width - (cur.value < 0 ? cur.width : 0)
          }
        })
      })
      lastGroup[0].x -= lastGroup[0].width
    }
  }

  private transformPercentage() {
    const {variant} = this.style,
      {width, height} = this.options.layout

    this.rectData.forEach((group) => {
      const total = group.reduce(
          (prev, cur) => prev + Number(cur.value),
          Number.MIN_VALUE
        ),
        percentages = group.map(({value}) => Number(value) / total)

      group.map((item, i) => {
        item.value = Number(formatNumber(percentages[i], {decimals: 4}))
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
    const {variant, fixedWidth, fixedHeight} = this.style

    this.rectData = this.rectData.map((group) => {
      return group.map(({x, y, width, height, ...rest}) => {
        const realWith = getPercentageNumber(fixedWidth, width),
          realHeight = getPercentageNumber(fixedHeight, height)

        if (variant === 'column') {
          return {
            ...rest,
            x: x + (width - realWith) / 2,
            y: rest.value < 0 ? y + height - realHeight : y,
            width: realWith,
            height: realHeight,
          }
        } else {
          return {
            ...rest,
            x: rest.value > 0 ? x + width - realWith : x,
            y: y + (height - realHeight) / 2,
            width: realWith,
            height: realHeight,
          }
        }
      })
    })
  }

  private createScale() {
    if (!this.data) return

    const {headers} = this.data,
      {variant, mode} = this.style,
      {width, height} = this.options.layout,
      selectMode = mode === 'stack' ? 'sum' : 'copy',
      bandDomain = this.data.lists[0] as string[],
      range1 = this.data.select(headers.slice(1), {mode: selectMode}).range(),
      range2 = this.data.select(headers.slice(1), {mode: 'copy'}).range(),
      finalRange = [
        Math.min(range1[0], range2[0]),
        Math.max(range1[1], range2[1]),
      ],
      linearDomain = (mode !== 'percentage' ? finalRange : [0, 1]) as Vec2

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
    const {variant} = this.style,
      {labelPosition, labelPositionOrient, text: originText = {}} = this.style,
      position1 = getAttr(labelPosition, 0, 'center'),
      position2 = getAttr(labelPosition, 1, 'center')

    this.textData = this.rectData.map((group) =>
      group.map(({value, x: originX, y: originY, width, height, meta}) => {
        const text = cloneDeep(originText),
          [offsetX = 0, offsetY = 0] = text.offset ?? [],
          labelPosition = value > 0 ? position1 : position2
        let position: Position9 = 'center',
          [x, y] = [originX, originY]

        if (value < 0) {
          text.offset = [
            variant === 'column' ? offsetX : -offsetX,
            variant === 'bar' ? offsetY : -offsetY,
          ]
        }

        if (labelPosition === 'top') {
          x = originX + width / 2
          position = labelPositionOrient === 'inner' ? 'bottom' : 'top'
        } else if (labelPosition === 'bottom') {
          x = originX + width / 2
          y = originY + height
          position = labelPositionOrient === 'inner' ? 'top' : 'bottom'
        } else if (labelPosition === 'left') {
          y = originY + height / 2
          position = labelPositionOrient === 'inner' ? 'right' : 'left'
        } else if (labelPosition === 'right') {
          x = originX + width
          y = originY + height / 2
          position = labelPositionOrient === 'inner' ? 'left' : 'right'
        } else if (labelPosition === 'center') {
          x = originX + width / 2
          y = originY + height / 2
        }

        return createText({x, y, position, value, style: text, meta})
      })
    )
  }

  draw() {
    const rectData = this.rectData.map((group) => ({
      data: group,
      ...this.style.rect,
      fill: group.map(({color}) => color ?? 'black'),
    }))
    const background = this.backgroundData.map((group) => ({
      data: [group],
      ...this.style.background,
    }))
    const textData = this.textData.map((group) => ({
      data: group,
      ...this.style.text,
    }))

    this.drawBasic({type: 'rect', key: 'background', data: background})
    this.drawBasic({type: 'rect', key: 'rect', data: rectData})
    this.drawBasic({type: 'text', key: 'text', data: textData})
  }
}
