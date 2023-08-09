import {select} from 'd3'
import {isEqual, isNil, merge} from 'lodash'
import {D3Selection, ElConfig, TooltipData, TooltipOptions} from '../types'
import {createLog, errorCatcher, getAttr, noChange, ungroup} from '../utils'

const defaultOptions = {
  container: null,
  mode: 'single',
  pointSize: 10,
  titleSize: 14,
  labelSize: 12,
  valueSize: 12,
  textColor: '#383d41',
  backgroundColor: '#c3c4c5',
} as Required<TooltipOptions>

export class Tooltip {
  public isVisible = false

  public isAvailable = false

  private instance: D3Selection

  private options = defaultOptions

  private data: Maybe<TooltipData> = null

  private hideTimeout: NodeJS.Timeout | undefined

  readonly log = createLog(Tooltip.name)

  constructor(options: TooltipOptions) {
    this.setOptions(options)
    const {container, backgroundColor, mode} = this.options
    this.instance = select(container)
      .append('div')
      .attr('class', 'tooltip')
      .style('border-radius', '4px')
      .style('row-gap', '4px')
      .style('flex-direction', 'column')
      .style('background-color', backgroundColor)
      .style('position', 'fixed')
      .style('overflow', 'hidden')
      .style('display', 'none')
      .style('z-index', 999999)
      .style('left', 0)
      .style('top', 0)
    this.getListData = errorCatcher(this.getListData.bind(this), (error) => {
      this.log.error(`The layer does not support ${mode} mode`, error)
    })
  }

  setOptions(options: Partial<TooltipOptions>) {
    this.options = merge({}, this.options, options)
  }

  show(event: MouseEvent) {
    this.isVisible = true
    this.instance?.style('display', 'flex')
    clearTimeout(this.hideTimeout)
    this.move(event)
  }

  hide() {
    this.hideTimeout = setTimeout(() => {
      this.isVisible = false
      this.instance?.style('display', 'none')
    })
  }

  private getListData(data: ElConfig): TooltipData {
    const {mode} = this.options
    const {dimension, category} = data.source.meta ?? {}

    if (this.options.mode === 'single') {
      return this.getSingleListData(data)
    }

    if (mode === 'dimension' && dimension) {
      return this.getDimensionListData(data)
    }

    if (mode === 'category' && category) {
      return this.getCategoryListData(data)
    }
  }

  private getSingleListData(data: ElConfig): TooltipData {
    return {
      title: data.source.meta.dimension,
      list: Object.entries(data.source.meta ?? []).map(([key, value]) => ({
        color: data.fill || data.stroke,
        label: key,
        value,
      })),
    }
  }

  private getDimensionListData(data: ElConfig): TooltipData {
    const dimension = data.source.meta.dimension
    const backups = this.options.getLayersBackupData()
    const matchedGroups = backups.filter(
      ({source}) => ungroup(source)?.meta.dimension === dimension
    )

    return {
      title: dimension,
      list: matchedGroups.flatMap(({source, fill, stroke}) =>
        source.flatMap(({meta}, i) => ({
          color: getAttr(fill, i, '') || getAttr(stroke, i, ''),
          label: meta.category,
          value: meta.value,
        }))
      ),
    }
  }

  private getCategoryListData(data: ElConfig): TooltipData {
    const category = data.source.meta.category
    const backups = this.options.getLayersBackupData()
    const matchedGroups = backups.flatMap(({source}) =>
      source.filter((item) => item.meta.category === category)
    )

    return {
      title: ungroup(matchedGroups)?.meta.category,
      list: matchedGroups.map(({meta}, i) => ({
        color: getAttr(data.fill, i, '') || getAttr(data.stroke, i, ''),
        label: meta.dimension,
        value: meta.value,
      })),
    }
  }

  update({data}: {data: ElConfig}) {
    if (!isNil(this.options.render)) {
      this.options.render(this.instance.node(), data)
      return
    }

    const {setTooltipData = noChange, ...style} = this.options
    const tooltipData = setTooltipData(this.getListData(data), this.options)

    if (tooltipData && !isEqual(this.data, tooltipData)) {
      this.data = tooltipData
      this.instance
        .style('padding', '8px')
        .selectAll('.tooltip-title')
        .data([tooltipData.title])
        .join('div')
        .attr('class', 'tooltip-title')
        .style('display', (d) => (d ? 'block' : 'none'))
        .style('font-size', `${style.titleSize}px`)
        .style('color', style.textColor)
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
        .data(tooltipData.list.filter(({label, value}) => label || value))
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
        .style('width', `${style.pointSize}px`)
        .style('height', `${style.pointSize}px`)
        .style('border-radius', '100%')
        .style('margin-right', '5px')
        .style('background-color', (d) => d.color ?? '')
      pointWidthLabel
        .append('span')
        .style('white-space', 'nowrap')
        .style('font-size', `${style.labelSize}px`)
        .style('color', style.textColor)
        .text((d) => d.label ?? '')
      rows
        .append('span')
        .style('white-space', 'nowrap')
        .style('font-weight', 'bold')
        .style('font-size', `${style.valueSize}px`)
        .style('color', style.textColor)
        .text((d) => d.value ?? '')
    }
  }

  move({clientX: x, clientY: y}: MouseEvent) {
    const rect = this.instance.node().getBoundingClientRect()
    const drift = 10

    if (x + rect.width > document.body.clientWidth) {
      x -= rect.width + drift
    } else {
      x += drift
    }
    if (y + rect.height > document.body.clientHeight) {
      y -= rect.height + drift
    } else {
      y += drift
    }

    this.instance.style('left', `${x}px`).style('top', `${y}px`)
  }

  destroy() {
    this.hide()
    this.data = null
    this.isAvailable = false
    this.instance.remove()
  }
}
