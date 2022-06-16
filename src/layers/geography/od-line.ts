import {LayerBase} from '../base'
import {DataTableList} from '../../data'
import {createScale, createStyle, validateAndCreateData} from '../helpers'
import {
  ChartContext,
  BackupAnimationOptions,
  LayerODLineOptions,
  LayerODLineScaleShape,
  LayerODLineStyleShape,
} from '../../types'
import {path as d3Path} from 'd3-path'
import {isRealNumber} from '../../utils'

const defaultStyle: LayerODLineStyleShape = {
  odLine: {
    fillOpacity: 0,
    strokeWidth: 1,
  },
  flyingObject: {
    path: null,
  },
}

const defaultAnimation: BackupAnimationOptions = {
  flyingObject: {
    loop: {
      type: 'path',
      path: '.chart-basic-odLine',
    },
  },
}

export class LayerODLine extends LayerBase<LayerODLineOptions> {
  private _data: Maybe<DataTableList>

  private _scale: LayerODLineScaleShape

  private _style = defaultStyle

  private flyingObjectData: {
    path: string
  }[] = []

  private odLineData: {
    path: string
    position: Record<'fromX' | 'fromY' | 'toX' | 'toY', number>
    source: {
      category: 'from' | 'to'
      value: string
    }[]
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
      tooltipTargets: ['odLine'],
    })
  }

  setData(data: LayerODLine['data']) {
    this._data = validateAndCreateData('tableList', this.data, data)
  }

  setScale(scale: LayerODLineScaleShape) {
    this._scale = createScale(undefined, this.scale, scale)
  }

  setStyle(style: LayerODLineStyleShape) {
    this._style = createStyle(defaultStyle, this.style, style)
  }

  update() {
    if (!this.data || !this.scale?.scaleX || !this.scale.scaleY) {
      throw new Error('Invalid data or scale')
    }

    const {left, top} = this.options.layout,
      {headers, rawTableList} = this.data,
      {flyingObject} = this.style,
      fromXIndex = headers.findIndex((header) => header === 'fromX'),
      fromYIndex = headers.findIndex((header) => header === 'fromY'),
      toXIndex = headers.findIndex((header) => header === 'toX'),
      toYIndex = headers.findIndex((header) => header === 'toY'),
      {scaleX, scaleY} = this.scale

    this.odLineData = rawTableList.map((d) => {
      const [fromX, fromY, toX, toY] = [d[fromXIndex], d[fromYIndex], d[toXIndex], d[toYIndex]]
      const position = {
        fromX: left + scaleX(fromX),
        fromY: top + scaleY(fromY),
        toX: left + scaleX(toX),
        toY: top + scaleY(toY),
      }

      return {
        source: [
          {category: 'from', value: `(${fromX},${fromY})`},
          {category: 'to', value: `(${toX},${toY})`},
        ],
        // geo coordinates => svg coordinates
        path: this.getPath(position),
        position,
      }
    })

    if (flyingObject?.path) {
      this.flyingObjectData = this.odLineData.map(() => ({path: flyingObject.path!}))
      this.setAnimation(defaultAnimation)
    }
  }

  private getPath = (props: ArrayItem<LayerODLine['odLineData']>['position'] & {arc?: number}) => {
    const path = d3Path(),
      {fromX, fromY, toX, toY, arc = 0.5} = props,
      [deltaX, deltaY] = [toX - fromX, toY - fromY],
      theta = Math.atan(deltaY / deltaX),
      len = (Math.sqrt(deltaX ** 2 + deltaY ** 2) / 2) * arc,
      controlPoint = [
        (fromX + toX) / 2 + len * Math.cos(theta - Math.PI / 2),
        (fromY + toY) / 2 + len * Math.sin(theta - Math.PI / 2),
      ]

    if (Object.values(props).some((value) => !isRealNumber(value))) {
      return ''
    }

    path.moveTo(fromX, fromY)
    path.quadraticCurveTo(controlPoint[0], controlPoint[1], toX, toY)

    return path.toString()
  }

  draw() {
    const odLineData = {
      data: this.odLineData.filter(({path}) => Boolean(path)),
      source: this.odLineData.map(({source}) => source),
      ...this.style.odLine,
    }
    const flyingObjectData = {
      data: this.flyingObjectData,
      ...this.style.flyingObject,
    }

    this.drawBasic({type: 'path', data: [odLineData], sublayer: 'odLine'})
    this.drawBasic({type: 'path', data: [flyingObjectData], sublayer: 'flyingObject'})
  }
}
