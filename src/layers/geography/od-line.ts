import {LayerBase} from '../base'
import {DataTableList} from '../../data'
import {path as d3Path} from 'd3-path'
import {isRealNumber, isSC, tableListToObjects} from '../../utils'
import {checkColumns, createScale, createStyle, makeClass, validateAndCreateData} from '../helpers'
import {lightTheme} from '../../core/theme'
import {
  ChartContext,
  CacheLayerAnimation,
  LayerODLineOptions,
  LayerODLineScale,
  LayerODLineStyle,
  AnimationPathOptions,
  PathDrawerProps,
  DrawerData,
  LayerStyle,
} from '../../types'

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

const defaultAnimation: CacheLayerAnimation<AnimationPathOptions>['options'] = {
  flyingObject: {
    loop: {
      path: makeClass('odLine', false),
      ...lightTheme.animation.loop,
    },
  },
}

export class LayerODLine extends LayerBase<LayerODLineOptions> {
  private _data: Maybe<DataTableList>

  private _scale: LayerODLineScale

  private _style = defaultStyle

  private flyingObjectData: DrawerData<PathDrawerProps>[] = []

  private odLineData: {
    path: string | null
    position: Record<DataKey, number>
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
        source: [
          {category: 'from', value: `(${d.fromX},${d.fromY})`},
          {category: 'to', value: `(${d.toX},${d.toY})`},
        ],
        // geo coordinates => svg coordinates
        path: this.getPath(position),
        position,
      }
    })

    if (flyingObject?.path) {
      this.setAnimation(defaultAnimation)
      this.flyingObjectData = this.odLineData.map(() => ({
        path: flyingObject.path!,
        centerX: -1000,
        centerY: -1000,
      }))
      this.event.on('flyingObject-animation-start', () => {
        if (isSC(this.root) && this.odLineData.some(({path}) => path)) {
          this.root.selectAll(makeClass('flyingObject', true)).style('transform', null)
        }
      })
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
      return null
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
