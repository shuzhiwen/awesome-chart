import {select} from 'd3'
import {Graphics} from 'pixi.js'
import {EVENT_KEY} from '../../core'
import {DataTableList} from '../../data'
import {
  DrawerData,
  ElConfig,
  LayerAxisScale,
  LayerInteractiveStyle,
  LayerOptions,
  LayerStyle,
  LegendData,
  RectDrawerProps,
} from '../../types'
import {isSC, isScaleBand, isScaleLinear, uuid} from '../../utils'
import {LayerBase} from '../base'
import {
  createScale,
  createStyle,
  elClass,
  selector,
  stickyBandScale,
  validateAndCreateData,
} from '../helpers'
import {LayerAuxiliary} from './auxiliary'

type Key = 'rect' | 'interactive'

const defaultStyle: LayerInteractiveStyle = {
  line: {
    stroke: 'orange',
    strokeWidth: 2,
  },
  interactive: {
    opacity: 0,
    fill: '#000000',
  },
}

export class LayerInteractive extends LayerBase<Key> {
  public legendData: Maybe<LegendData>

  private _data: Maybe<DataTableList>

  private _scale: LayerAxisScale = {}

  private _style = defaultStyle

  private rectDataX: (DrawerData<RectDrawerProps> & {
    meta: AnyObject
  })[][] = []

  private rectDataY: (DrawerData<RectDrawerProps> & {
    meta: AnyObject
  })[][] = []

  private helperAuxiliary: [LayerAuxiliary, LayerAuxiliary]

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
      sublayers: ['rect', 'interactive'],
      interactive: ['interactive'],
    })
    const {layout, createSublayer, event} = this.options

    this.systemEvent.onWithOff('destroy', EVENT_KEY, () => {
      this.helperAuxiliary.forEach((auxiliary) => auxiliary.destroy())
    })

    this.helperAuxiliary = [
      createSublayer({
        ...this.options,
        id: uuid(),
        type: 'auxiliary',
        sublayerConfig: {root: this.root},
      })!,
      createSublayer({
        ...this.options,
        id: uuid(),
        type: 'auxiliary',
        sublayerConfig: {root: this.root},
      })!,
    ]

    this.helperAuxiliary[0].setStyle({labelPosition: 'top', direction: 'vertical'})
    this.helperAuxiliary[1].setStyle({labelPosition: 'right', direction: 'horizontal'})
    this.helperAuxiliary.forEach((layer) => {
      layer.options.theme.animation.update.duration = 100
    })

    event.on('globalEvent', this.className, ({event}: {event: MouseEvent}) => {
      const {offsetX, offsetY} = event,
        {scaleX, scaleY} = this.scale,
        {left, right, top, bottom} = layout,
        [helperAuxiliaryX, helperAuxiliaryY] = this.helperAuxiliary
      let x: Maybe<number>, y: Maybe<number>

      if (offsetX < left || offsetX > right || offsetY < top || offsetY > bottom) {
        helperAuxiliaryX.setVisible(false)
        helperAuxiliaryY.setVisible(false)
        return
      }

      if (isScaleLinear(scaleX)) {
        x = scaleX.invert(offsetX - left)
        helperAuxiliaryX.setVisible(true)
        helperAuxiliaryX.setData(
          new DataTableList([
            ['label', 'value'],
            ['helperAuxiliaryX', Number(x).toFixed(2)],
          ])
        )
        helperAuxiliaryX.draw()
      } else if (isScaleBand(scaleX)) {
        helperAuxiliaryX.setVisible(true)
        helperAuxiliaryX.setData(
          new DataTableList([
            ['label', 'value'],
            ['helperAuxiliaryX', stickyBandScale(scaleX, offsetX - left).domain],
          ])
        )
        helperAuxiliaryX.draw()
      }

      if (isScaleLinear(scaleY)) {
        y = scaleY.invert(offsetY - top)
        helperAuxiliaryY.setVisible(true)
        helperAuxiliaryY.setData(
          new DataTableList([
            ['label', 'value'],
            ['helperAuxiliaryY', Number(y).toFixed(2)],
          ])
        )
        helperAuxiliaryY.draw()
      } else if (isScaleBand(scaleY)) {
        helperAuxiliaryY.setVisible(true)
        helperAuxiliaryY.setData(
          new DataTableList([
            ['label', 'value'],
            ['helperAuxiliaryY', stickyBandScale(scaleY, offsetY - top).domain],
          ])
        )
        helperAuxiliaryY.draw()
      }
    })
  }

  setData(data: LayerInteractive['data']) {
    this._data = validateAndCreateData('base', this.data, data)
  }

  setScale(scale: LayerAxisScale) {
    this._scale = createScale({}, this.scale, scale)
    this.helperAuxiliary.map((layer) => layer.setScale(this.scale))
  }

  setStyle(style: LayerStyle<LayerInteractiveStyle>) {
    this._style = createStyle(this.options, defaultStyle, this.style, style)
    this.helperAuxiliary.map((layer) => layer.setStyle(this.style))
  }

  update() {
    if (!this.scale.scaleX || !this.scale.scaleY) {
      throw new Error('Invalid scale')
    }

    const {scaleX, scaleY} = this.scale,
      {width, height, left, top} = this.options.layout

    if (isScaleBand(scaleX)) {
      this.rectDataX = scaleX.domain().map((domain, i, array) => {
        const rectX = scaleX(domain) ?? 0,
          rectWidth = scaleX.bandwidth(),
          paddingWidth = width - scaleX.bandwidth() * array.length,
          halfGap = paddingWidth / (array.length - 1) / 2,
          [isHead, isTail] = [i === 0, i === array.length - 1]

        return [
          {
            x: left,
            y: top,
            height,
            width: rectX - (isHead ? 0 : halfGap),
            meta: {key: `x-${i}-secondary`},
          },
          {
            x: left + rectX - (isHead ? 0 : halfGap),
            y: top,
            height,
            width: rectWidth + halfGap * (isHead || isTail ? 1 : 2),
            meta: {key: `x-${i}`, dimension: domain},
          },
          {
            x: left + rectX + rectWidth + halfGap * (isTail ? 0 : 1),
            y: top,
            height,
            width: Math.abs(width - rectX - rectWidth - halfGap * (isTail ? 0 : 1)),
            meta: {key: `x-${i}-secondary`},
          },
        ]
      })
    }

    if (isScaleBand(scaleY)) {
      this.rectDataY = scaleY.domain().map((domain, i, array) => {
        const rectY = scaleY(domain) ?? 0,
          rectHeight = scaleY.bandwidth(),
          paddingHeight = height - scaleY.bandwidth() * array.length,
          halfGap = paddingHeight / (array.length - 1) / 2,
          [isHead, isTail] = [i === 0, i === array.length - 1]

        return [
          {
            x: left,
            y: top,
            width,
            height: rectY - (isHead ? 0 : halfGap),
            meta: {key: `y-${i}-secondary`},
          },
          {
            x: left,
            y: top + rectY - (isHead ? 0 : halfGap),
            width,
            height: rectHeight + halfGap * (isHead || isTail ? 1 : 2),
            meta: {key: `y-${i}`, dimension: domain},
          },
          {
            x: left,
            y: top + rectY + rectHeight + halfGap * (isTail ? 0 : 1),
            width,
            height: Math.abs(height - rectY - rectHeight - halfGap * (isTail ? 0 : 1)),
            meta: {key: `y-${i}-secondary`},
          },
        ]
      })
    }
  }

  draw() {
    const darkRectData = [...this.rectDataY, ...this.rectDataX].map(([head, , tail]) => ({
      data: [head, tail],
      evented: false,
      ...this.style.interactive,
    }))
    const lightRectData = [...this.rectDataY, ...this.rectDataX].map(([, body]) => ({
      data: [body],
      evented: true,
      ...this.style.interactive,
    }))

    this.drawBasic({
      type: 'rect',
      key: 'interactive',
      data: darkRectData.concat(lightRectData),
    })

    this.event.onWithOff('mouseover-interactive', EVENT_KEY, ({data, target}) => {
      const getKey = (data: ElConfig) => data.source.meta.key as string
      const shadowOpacity = 0.5

      if (getKey(data).match('secondary')) {
        return
      }

      if (isSC(this.root)) {
        this.root.selectAll(`.${elClass('interactive')}`).each((d, i, els) => {
          if (getKey(d as ElConfig).match(getKey(data))) {
            select(els[i]).attr('opacity', shadowOpacity)
          }
        })
        select(target as HTMLElement).attr('opacity', 0)
      } else {
        selector.getChildren(this.root, elClass('interactive')).forEach((c) => {
          if (getKey(c.data!).match(getKey(data))) {
            c.alpha = shadowOpacity
          }
        })
        ;(target as Graphics).alpha = 0
      }
    })
    this.event.onWithOff('mouseout-interactive', EVENT_KEY, () => {
      if (isSC(this.root)) {
        this.root.selectAll(`.${elClass('interactive')}`).attr('opacity', 0)
      } else {
        selector.getChildren(this.root, elClass('interactive')).forEach((child) => {
          child.alpha = 0
        })
      }
    })
  }
}
