import {GeoGeometryObjects, geoMercator, geoPath} from 'd3'
import {DataBase} from '../../data'
import {
  ChartContext,
  DrawerData,
  ElSource,
  LayerBasemapOptions,
  LayerBasemapScale,
  LayerBasemapStyle,
  LayerStyle,
  RectDrawerProps,
  TextDrawerProps,
} from '../../types'
import {LayerBase} from '../base'
import {createScale, createStyle, createText, validateAndCreateData} from '../helpers'

type GeoFeature = {
  type: 'Feature'
  properties: AnyObject
  geometry: GeoGeometryObjects
}

const getGeoJSON = (adcode: Meta) => `http://cdn.dtwave.com/waveview/geojson/${adcode}.json`

const defaultStyle: LayerBasemapStyle = {
  block: {
    fill: 'lightblue',
  },
}

export class LayerBasemap extends LayerBase<LayerBasemapOptions> {
  private _data: Maybe<
    DataBase<
      | number
      | {
          type: 'FeatureCollection'
          features: GeoFeature[]
        }
    >
  >

  private _scale: LayerBasemapScale

  private _style = defaultStyle

  private fetchTimeout: Maybe<NodeJS.Timeout>

  private textData: DrawerData<TextDrawerProps>[] = []

  private path: Maybe<d3.GeoPath<any, d3.GeoPermissibleObjects>>

  private backgroundData: DrawerData<RectDrawerProps>[] = []

  private blockData: {
    properties: AnyObject
    geometry: any
    source: ElSource
  }[] = []

  private parentCode: number[] = []

  private chinaBlocks: {
    adcode: number
    lng: number
    lat: number
    name: string
    level: string
    parent: number
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

  constructor(options: LayerBasemapOptions, context: ChartContext) {
    super({
      options,
      context,
      sublayers: ['block', 'background', 'text'],
      interactive: ['block'],
    })

    fetch(getGeoJSON('all'))
      .then((res) => res.json())
      .then((data) => (this.chinaBlocks = data))
      .catch((e) => this.log.error('Fetch map data failed', e))
  }

  setData(data: LayerBasemap['data']) {
    this._data = validateAndCreateData('base', this.data, data)
  }

  setScale(scale: LayerBasemapScale) {
    this._scale = createScale(undefined, this.scale, scale)
  }

  setStyle(style: LayerStyle<LayerBasemapStyle>) {
    this._style = createStyle(this.options, defaultStyle, this.style, style)
  }

  update() {
    if (!this.data) {
      throw new Error('Invalid data')
    } else if (typeof this.data.source === 'number') {
      this.fetchOnlineData(this.data.source)
      this._scale = {scaleX: () => NaN, scaleY: () => NaN}
      return
    }

    const {top, left, right, bottom, width, height} = this.options.layout
    const projection = geoMercator().fitExtent(
      [
        [left, top],
        [right, bottom],
      ],
      this.data.source
    )

    this._scale = createScale(
      {
        scaleX: (x: number) => (projection([x, 0])?.[0] ?? 0) - left,
        scaleY: (y: number) => (projection([0, y])?.[1] ?? 0) - top,
      },
      this.scale
    )

    this.path = geoPath(projection)

    this.backgroundData = [{x: left, y: top, width, height}]

    this.blockData = this.data.source.features.map(({properties, ...rest}) => ({
      source: Object.entries(properties).map(([category, value]) => ({category, value})),
      properties,
      ...rest,
    }))

    this.textData = this.blockData.map(({properties, geometry}) =>
      createText({
        value: properties.name,
        x: this.path?.centroid(geometry)[0] ?? 0,
        y: this.path?.centroid(geometry)[1] ?? 0,
        style: this.style.text,
        position: 'center',
      })
    )
  }

  private fetchOnlineData(code: number) {
    if (this.chinaBlocks.length === 0) {
      if (this.fetchTimeout) {
        clearTimeout(this.fetchTimeout)
        this.fetchTimeout = null
      }
      this.fetchTimeout = setTimeout(() => this.fetchOnlineData(code), 50)
      return
    }

    const children = this.chinaBlocks.filter(({parent}) => parent === code)

    Promise.all<{features: GeoFeature[]}>(
      children.map(({adcode}) => {
        return new Promise((resolve, reject) => {
          fetch(getGeoJSON(adcode))
            .then((res) => resolve(res.json()))
            .catch((e) => reject(e))
        })
      })
    )
      .catch((e) => this.log.error('Fetch map data failed', e))
      .then((list) => {
        if (list) {
          this.setData(
            new DataBase({
              type: 'FeatureCollection',
              features: list.reduce<GeoFeature[]>((prev, cur) => [...prev, ...cur.features], []),
            })
          )
          this.update()
          this.draw()
        }
      })
  }

  draw() {
    const blockData = {
      data: this.blockData.map(({geometry}) => ({
        path: this.path!(geometry),
        centerX: 0,
        centerY: 0,
      })),
      source: this.blockData.map(({source}) => source),
      ...this.style.block,
    }
    const textData = {
      data: this.textData,
      ...this.style.text,
    }
    const rectData = {
      data: this.backgroundData,
      fillOpacity: 0,
    }

    this.drawBasic({type: 'rect', data: [rectData], sublayer: 'background'})
    this.drawBasic({type: 'path', data: [blockData], sublayer: 'block'})
    this.drawBasic({type: 'text', data: [textData]})

    // reset coordinate system
    if (this.blockData.length) {
      this.options.rebuildScale({trigger: this, redraw: true})
    }

    this.event.onWithOff('click-background', 'internal', () => {
      const parentCode = this.parentCode.pop()
      if (parentCode) {
        this.fetchOnlineData(parentCode)
      }
    })

    this.event.onWithOff('click-block', 'internal', ({data}) => {
      const blockCode = data.source.find(({category}: ElSource) => category === 'adcode')?.value
      this.parentCode.push(
        data.source.find(({category}: ElSource) => category === 'parent')?.value?.adcode
      )
      if (blockCode) {
        this.fetchOnlineData(blockCode)
      }
    })
  }
}
