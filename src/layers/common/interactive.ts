import {LayerBase} from '../base'
import {DataTableList} from '../../data'
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
import {LayerAuxiliary} from './auxiliary'
import {isScaleBand, isScaleLinear, isSvgContainer, uuid} from '../../utils'
import {stickyBandScale} from '../helpers/sticky-scale'
import {select} from 'd3'

const shadowOpacity = 0.1

const defaultStyle: LayerInteractiveStyleShape = {
  line: {
    stroke: 'yellow',
  },
  interactive: {
    opacity: 0,
    fill: 'yellow',
  },
}

export class LayerInteractive extends LayerBase<LayerInteractiveOptions> {
  public legendData: Maybe<LegendDataShape>

  private _data: Maybe<DataTableList>

  private _scale: LayerAxisScaleShape = {}

  private _style = defaultStyle

  private rectDataX: (DrawerDataShape<RectDrawerProps> & {
    source: ElSourceShape
  })[] = []

  private rectDataY: (DrawerDataShape<RectDrawerProps> & {
    source: ElSourceShape
  })[] = []

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
    super({context, options, sublayers: ['rect', 'interactive']})
    const {layout, createSublayer, event} = this.options

    this.event.on('destroy', () => {
      this.helperAuxiliary.forEach((auxiliary) => auxiliary.destroy())
    })

    this.helperAuxiliary = [
      createSublayer({
        id: uuid(),
        layout,
        type: 'auxiliary',
      }),
      createSublayer({
        id: uuid(),
        layout,
        type: 'auxiliary',
      }),
    ] as LayerInteractive['helperAuxiliary']

    this.helperAuxiliary[0].setStyle({labelPosition: 'top', direction: 'vertical'})
    this.helperAuxiliary[1].setStyle({labelPosition: 'right', direction: 'horizontal'})

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
      this.rectDataX = scaleX.domain().map((domain) => ({
        x: left + (scaleX(domain) ?? 0),
        y: top,
        height,
        width: scaleX.bandwidth(),
        source: {dimension: domain},
      }))
    }

    if (isScaleBand(scaleY)) {
      this.rectDataY = scaleY.domain().map((domain) => ({
        x: left,
        y: top + (scaleY(domain) ?? 0),
        width,
        height: scaleY.bandwidth(),
        source: {dimension: domain},
      }))
    }
  }

  draw() {
    const rectData = [...this.rectDataY, ...this.rectDataX].map((data) => ({
      data: [data],
      source: [data.source],
      ...this.style.interactive,
    }))

    this.drawBasic({type: 'rect', data: rectData, sublayer: 'interactive', priority: 'bottomHigh'})
    this.event.onWithOff('mouseover-interactive', this.options.id, ({data, event}) => {
      if (isSvgContainer(this.root)) {
        this.root.selectAll(generateClass('interactive', true)).attr('opacity', shadowOpacity)
        select(event.originalTarget).attr('opacity', 1)
      } else {
        ;(
          selector.getChildren(this.root, generateClass('interactive', false)) as FabricObject[]
        ).forEach((child) => (child.opacity = shadowOpacity))
        ;(data as FabricObject).opacity = 1
      }
    })
    this.event.onWithOff('mouseout-interactive', this.options.id, () => {
      if (isSvgContainer(this.root)) {
        this.root.selectAll(generateClass('interactive', true)).attr('opacity', 0)
      } else {
        ;(
          selector.getChildren(this.root, generateClass('interactive', false)) as FabricObject[]
        ).forEach((child) => (child.opacity = 0))
      }
    })
  }
}
