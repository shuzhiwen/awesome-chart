import {select} from 'd3'
import {createLog, getAttr, group, ungroup} from '../utils'
import {isEqual, isArray, merge, isFunction} from 'lodash'
import {ElConfigShape, D3Selection, BackupDataShape, TooltipOptions} from '../types'

const defaultOptions = {
  container: null,
  mode: 'single',
  pointSize: 10,
  titleSize: 14,
  titleColor: '#383d41',
  labelSize: 12,
  labelColor: '#383d41',
  valueSize: 12,
  valueColor: '#383d41',
  backgroundColor: '#c3c4c5',
} as Required<TooltipOptions>

export class Tooltip {
  readonly log = createLog(Tooltip.name)

  private instance: D3Selection

  private options = defaultOptions

  private _data: Maybe<any> = null

  public isVisible = false

  public isAvailable = false

  get data() {
    return this._data
  }

  constructor(options: TooltipOptions) {
    this.options = merge({}, defaultOptions, options)
    const {container, backgroundColor} = this.options
    this.instance = select(container)
      .append('div')
      .attr('class', 'tooltip')
      .style('border-radius', '4px')
      .style('padding', '8px')
      .style('row-gap', '4px')
      .style('flex-direction', 'column')
      .style('background-color', backgroundColor)
      .style('position', 'fixed')
      .style('overflow', 'hidden')
      .style('display', 'none')
      .style('z-index', 999999)
      .style('left', 0)
      .style('top', 0)
  }

  show(event: MouseEvent) {
    this.isVisible = true
    this.instance?.style('display', 'flex')
    event && this.move(event)
  }

  hide() {
    this.isVisible = false
    this.instance?.style('display', 'none')
  }

  private getListData<T>(data: Partial<ElConfigShape>, backup: BackupDataShape<T>) {
    try {
      if (this.options.mode === 'single') {
        const {fill, stroke, source} = data,
          pointColor = ungroup(fill) || ungroup(stroke) || '#000'

        return group(source).map((item) => ({pointColor, ...item}))
      }

      if (this.options.mode === 'dimension') {
        const {dimension} = getAttr(data.source, 0, {}),
          elType = data.className?.split('-').at(-1) ?? '',
          groups = backup[elType].filter(({source}) => source?.[0].dimension === dimension),
          {source, fill, stroke} = groups[0]

        return source?.map((item, i) => ({
          pointColor: getAttr(fill, i, null) || getAttr(stroke, i, null) || '#000',
          ...item,
        }))
      }

      if (this.options.mode === 'category') {
        const {category} = getAttr(data.source, 0, {}),
          elType = data.className?.split('-').at(-1) ?? '',
          groups = backup[elType]
            .map(({source}) => source?.filter((item) => item.category === category))
            .reduce((prev, cur) => [...prev!, ...cur!], [])

        return groups?.map((item, i) => ({
          ...item,
          pointColor: getAttr(data.fill, i, null) || getAttr(data.stroke, i, null) || '#000',
          category: item.dimension,
          dimension: item.category,
        }))
      }
    } catch (error) {
      this.log.warn(`The layer does not support ${this.options.mode} mode`, error)
    }
  }

  update<T>({data, backup = {}}: {data: Partial<ElConfigShape>; backup?: BackupDataShape<T>}) {
    if (!data) {
      this.instance.html('')
      return
    }

    if (isFunction(this.options.render)) {
      this.options.render(this.instance.node(), data, backup)
      return
    }

    const list = this.getListData(data, backup)
    const {titleSize, titleColor, pointSize, labelSize, labelColor, valueSize, valueColor} =
      this.options

    if (isArray(list) && !isEqual(this.data, list)) {
      this._data = list
      this.instance
        .selectAll('.tooltip-title')
        .data([list[0]?.dimension])
        .join('div')
        .attr('class', 'tooltip-title')
        .style('display', (d) => (d ? 'block' : 'none'))
        .style('font-size', `${titleSize}px`)
        .style('color', titleColor)
        .style('position', 'relative')
        .text((d) => d!)
      const container = this.instance
        .selectAll('.tooltip-content')
        .data([null])
        .join('div')
        .attr('class', 'tooltip-content')
        .style('display', 'flex')
        .style('flex-direction', 'column')
        .style('justify-content', 'space-between')
        .style('align-items', 'center')
        .style('position', 'relative')
      container.selectAll('div').remove()
      const rows = container
        .selectAll('div')
        .data(list)
        .join('div')
        .style('display', 'flex')
        .style('flex-direction', 'row')
        .style('justify-content', 'space-between')
        .style('align-items', 'center')
        .style('width', '100%')
      const pointWidthLabel = rows
        .append('div')
        .style('display', 'flex')
        .style('flex-direction', 'row')
        .style('justify-content', 'space-between')
        .style('align-items', 'center')
        .style('margin-right', '20px')
      pointWidthLabel
        .append('div')
        .style('width', `${pointSize}px`)
        .style('height', `${pointSize}px`)
        .style('border-radius', '100%')
        .style('margin-right', '5px')
        .style('background-color', (d) => d.pointColor)
      pointWidthLabel
        .append('span')
        .style('white-space', 'nowrap')
        .style('font-size', `${labelSize}px`)
        .style('color', labelColor)
        .text((d) => d.category!)
      rows
        .append('span')
        .style('white-space', 'nowrap')
        .style('font-weight', 'bold')
        .style('font-size', `${valueSize}px`)
        .style('color', valueColor)
        .text((d) => d.value!)
    }
  }

  move({pageX, pageY}: MouseEvent) {
    const drift = 10
    const rect = this.instance.node().getBoundingClientRect()

    if (pageX + rect.width > document.body.clientWidth) {
      pageX -= rect.width + drift
    } else {
      pageX += drift
    }
    if (pageY + rect.height > document.body.clientHeight) {
      pageY -= rect.height + drift
    } else {
      pageY += drift
    }

    this.instance.style('left', `${pageX}px`).style('top', `${pageY}px`)
  }

  destroy() {
    this.hide()
    this._data = null
    this.isAvailable = false
    this.instance.remove()
  }
}
