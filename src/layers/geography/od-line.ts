import {path} from 'd3'
import {DataTableList} from '../../data'
import {
  ChartContext,
  DrawerData,
  LayerODLineOptions,
  LayerODLineScale,
  LayerODLineStyle,
  LayerStyle,
  PathDrawerProps,
} from '../../types'
import {isRealNumber, isSC, tableListToObjects} from '../../utils'
import {LayerBase} from '../base'
import {checkColumns, createScale, createStyle, makeClass, validateAndCreateData} from '../helpers'

type Key = 'odLine' | 'flyingObject' | 'text'

type DataKey = 'fromX' | 'fromY' | 'toX' | 'toY'

const defaultStyle: LayerODLineStyle = {
  odLine: {
    fillOpacity: 0,
    strokeWidth: 1,
  },
  flyingObject: {
    path: null,
  },
}

export class LayerODLine extends LayerBase<LayerODLineOptions, Key> {
  private _data: Maybe<DataTableList>

  private _scale: LayerODLineScale

  private _style = defaultStyle

  private flyingObjectData: DrawerData<PathDrawerProps>[] = []

  private odLineData: {
    meta: AnyObject
    path: string | null
    position: Record<DataKey, number>
  }[] = []

  get scale() {
    return this._scale
  }

  get data() {
    return this._data
  }

  get style() {
    return this._style
  }

  constructor(options: LayerODLineOptions, context: ChartContext) {
    super({
      context,
      options,
      sublayers: ['odLine', 'flyingObject', 'text'],
      interactive: ['odLine'],
    })
  }

  setData(data: LayerODLine['data']) {
    this._data = validateAndCreateData('tableList', this.data, data)
    checkColumns(this.data, ['fromX', 'fromY', 'toX', 'toY'])
  }

  setScale(scale: LayerODLineScale) {
    this._scale = createScale(undefined, this.scale, scale)
  }

  setStyle(style: LayerStyle<LayerODLineStyle>) {
    this._style = createStyle(this.options, defaultStyle, this.style, style)
  }

  update() {
    if (!this.data || !this.scale?.scaleX || !this.scale.scaleY) {
      throw new Error('Invalid data or scale')
    }

    const {left, top} = this.options.layout,
      {scaleX, scaleY} = this.scale,
      {flyingObject} = this.style,
      data = tableListToObjects<DataKey>(this.data.source)

    this.odLineData = data.map((d) => {
      const position = {
        fromX: left + scaleX(d.fromX),
        fromY: top + scaleY(d.fromY),
        toX: left + scaleX(d.toX),
        toY: top + scaleY(d.toY),
      }

      return {
        meta: {from: `(${d.fromX},${d.fromY})`, to: `(${d.toX},${d.toY})`},
        // geo coordinates => svg coordinates
        path: this.getPath(position),
        position,
      }
    })

    if (flyingObject?.path) {
      this.setAnimation({
        flyingObject: {
          loop: {
            path: makeClass('odLine', false),
            ...this.options.theme.animation.loop,
          },
        },
      })
      this.flyingObjectData = this.odLineData.map(() => ({
        path: flyingObject.path!,
      }))
    }
  }

  private getPath = (props: ArrayItem<LayerODLine['odLineData']>['position'] & {arc?: number}) => {
    const instance = path(),
      {fromX, fromY, toX, toY, arc = 0.5} = props,
      [deltaX, deltaY] = [toX - fromX, toY - fromY],
      theta = Math.atan(deltaY / deltaX),
      len = (Math.sqrt(deltaX ** 2 + deltaY ** 2) / 2) * arc,
      controlPoint = [
        (fromX + toX) / 2 + len * Math.cos(theta - Math.PI / 2),
        (fromY + toY) / 2 + len * Math.sin(theta - Math.PI / 2),
      ]

    if (Object.values(props).some((value) => !isRealNumber(value))) {
      return null
    }

    instance.moveTo(fromX, fromY)
    instance.quadraticCurveTo(controlPoint[0], controlPoint[1], toX, toY)

    return instance.toString()
  }

  draw() {
    const odLineData = {
      data: this.odLineData.filter(({path}) =>
        Boolean(path)
      ) as (LayerODLine['odLineData'][number] & {path: string})[],
      ...this.style.odLine,
    }
    const flyingObjectData = {
      data: this.flyingObjectData,
      ...this.style.flyingObject,
      opacity: 0,
    }

    this.drawBasic({type: 'path', key: 'odLine', data: [odLineData]})
    this.drawBasic({type: 'path', key: 'flyingObject', data: [flyingObjectData]})

    this.cacheAnimation['animations']['flyingObject']?.event.on('start', 'internal', () => {
      if (isSC(this.root) && this.odLineData.some(({path}) => path)) {
        this.root
          .selectAll(makeClass('flyingObject', true))
          .transition()
          .duration(this.options.theme.animation.enter.duration)
          .attr('opacity', 1)
      }
    })
  }
}
