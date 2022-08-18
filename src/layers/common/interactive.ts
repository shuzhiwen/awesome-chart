import {select} from 'd3'
import {LayerBase} from '../base'
import {DataTableList} from '../../data'
import {LayerAuxiliary} from './auxiliary'
import {stickyBandScale} from '../helpers/sticky-scale'
import {isScaleBand, isScaleLinear, isSvgCntr, uuid} from '../../utils'
import {createScale, createStyle, generateClass, selector, validateAndCreateData} from '../helpers'
import {
  ChartContext,
  LayerInteractiveStyleShape,
  LegendDataShape,
  LayerAxisScaleShape,
  LayerInteractiveOptions,
  RectDrawerProps,
  DrawerDataShape,
  ElSourceShape,
  FabricObject,
} from '../../types'

const shadowOpacity = 0.5

const defaultStyle: LayerInteractiveStyleShape = {
  line: {
    stroke: 'yellow',
    strokeWidth: 1,
  },
  interactive: {
    opacity: 0,
    fill: '#000000',
  },
}

export class LayerInteractive extends LayerBase<LayerInteractiveOptions> {
  public legendData: Maybe<LegendDataShape>

  private _data: Maybe<DataTableList>

  private _scale: LayerAxisScaleShape = {}

  private _style = defaultStyle

  private rectDataX: (DrawerDataShape<RectDrawerProps> & {
    source?: ElSourceShape
  })[][] = []

  private rectDataY: (DrawerDataShape<RectDrawerProps> & {
    source?: ElSourceShape
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

  constructor(options: LayerInteractiveOptions, context: ChartContext) {
    super({context, options, sublayers: ['rect', 'interactive'], tooltipTargets: ['interactive']})
    const {layout, createSublayer, event} = this.options

    this.event.on('destroy', () => {
      this.helperAuxiliary.forEach((auxiliary) => auxiliary.destroy())
    })

    this.helperAuxiliary = [
      createSublayer({
        id: uuid(),
        layout,
        type: 'auxiliary',
        sublayerConfig: {root: this.root},
      }),
      createSublayer({
        id: uuid(),
        layout,
        type: 'auxiliary',
        sublayerConfig: {root: this.root},
      }),
    ] as LayerInteractive['helperAuxiliary']

    this.helperAuxiliary[0].setStyle({labelPosition: 'top', direction: 'vertical'})
    this.helperAuxiliary[1].setStyle({labelPosition: 'right', direction: 'horizontal'})
    this.helperAuxiliary.forEach((layer) => {
      layer.options.theme.animation.update.duration = 100
    })

    event.on('MouseEvent', ({event}: {event: MouseEvent}) => {
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

  setScale(scale: LayerAxisScaleShape) {
    this._scale = createScale(undefined, this.scale, scale)
    this.helperAuxiliary.map((layer) => layer.setScale(this.scale))
  }

  setStyle(style: LayerInteractiveStyleShape) {
    this._style = createStyle(defaultStyle, this.style, style)
    this.helperAuxiliary.map((layer) => layer.setStyle(this.style))
  }

  update() {
    if (!this.scale.scaleX || !this.scale.scaleY) {
      throw new Error('Invalid scale')
    }

    const {scaleX, scaleY} = this.scale,
      {width, height, left, top} = this.options.layout

    if (isScaleBand(scaleX)) {
      this.rectDataX = scaleX.domain().map((domain, i) => [
        {
          x: left,
          y: top,
          height,
          width: scaleX(domain) ?? 0,
          source: {key: `x-${i}-secondary`},
        },
        {
          x: left + (scaleX(domain) ?? 0),
          y: top,
          height,
          width: scaleX.bandwidth(),
          source: {key: `x-${i}`, dimension: domain},
        },
        {
          x: left + (scaleX(domain) ?? 0) + scaleX.bandwidth(),
          y: top,
          height,
          width: width - (scaleX(domain) ?? 0) - scaleX.bandwidth(),
          source: {key: `x-${i}-secondary`},
        },
      ])
    }

    if (isScaleBand(scaleY)) {
      this.rectDataY = scaleY.domain().map((domain, i) => [
        {
          x: left,
          y: top,
          width,
          height: scaleY(domain) ?? 0,
          source: {key: `y-${i}-secondary`},
        },
        {
          x: left,
          y: top + (scaleY(domain) ?? 0),
          width,
          height: scaleY.bandwidth(),
          source: {key: `y-${i}`, dimension: domain},
        },
        {
          x: left,
          y: top + (scaleY(domain) ?? 0) + scaleY.bandwidth(),
          width,
          height: height - (scaleY(domain) ?? 0) - scaleY.bandwidth(),
          source: {key: `y-${i}-secondary`},
        },
      ])
    }
  }

  draw() {
    const darkRectData = [...this.rectDataY, ...this.rectDataX].map(([head, , tail]) => ({
      data: [head, tail],
      source: [head.source, tail.source],
      ...this.style.interactive,
    }))
    const lightRectData = [...this.rectDataY, ...this.rectDataX].map(([, body]) => ({
      data: [body],
      source: [body.source],
      ...this.style.interactive,
    }))

    this.drawBasic({
      type: 'rect',
      data: darkRectData.concat(lightRectData),
      sublayer: 'interactive',
    })

    this.event.onWithOff('mouseover-interactive', this.options.id, ({data, event}) => {
      if (data.source.key.match('secondary')) {
        return
      }

      if (isSvgCntr(this.root)) {
        this.root.selectAll(generateClass('interactive', true)).each((d, i, els) => {
          if ((d as any).source?.key.match(data.source.key)) {
            select(els[i]).attr('opacity', shadowOpacity)
          }
        })
        select(event.target).attr('opacity', 0)
      } else {
        ;(
          selector.getChildren(this.root, generateClass('interactive', false)) as FabricObject[]
        ).forEach((child) => {
          if ((child as any).source?.key.match(data.source.key)) {
            child.opacity = shadowOpacity
          }
        })
        ;(data as FabricObject).opacity = 0
      }
    })
    this.event.onWithOff('mouseout-interactive', this.options.id, () => {
      if (isSvgCntr(this.root)) {
        this.root.selectAll(generateClass('interactive', true)).attr('opacity', 0)
      } else {
        ;(
          selector.getChildren(this.root, generateClass('interactive', false)) as FabricObject[]
        ).forEach((child) => (child.opacity = 0))
      }
    })
  }
}
