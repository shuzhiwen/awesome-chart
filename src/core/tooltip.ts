import {select} from 'd3'
import {isEqual, merge, isNil} from 'lodash'
import {errorCatcher, createLog, getAttr, group, ungroup, noChange} from '../utils'
import {ElConfigShape, D3Selection, TooltipOptions, TooltipDataShape} from '../types'

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

  readonly log = createLog(Tooltip.name)

  private instance: D3Selection

  private options = defaultOptions

  private data: Maybe<TooltipDataShape> = null

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
    event && this.move(event)
  }

  hide() {
    this.isVisible = false
    this.instance?.style('display', 'none')
  }

  private getListData(data: Partial<ElConfigShape>): TooltipDataShape {
    const {mode} = this.options,
      {dimension, category} = getAttr(data.source, 0, {})

    if (this.options.mode === 'single') {
      return this.getSingleListData(data)
    }

    if ((mode === 'dimension' && !dimension) || (mode === 'category' && !category))
      throw new Error()

    if (this.options.mode === 'dimension') {
      return this.getDimensionListData(data)
    }

    if (this.options.mode === 'category') {
      return this.getCategoryListData(data)
    }
  }

  private getSingleListData(data: Partial<ElConfigShape>): TooltipDataShape {
    return {
      title: ungroup(data.source)?.dimension,
      list: group(data.source).map(({value, category}) => ({
        color: data.fill || data.stroke,
        label: category,
        value,
      })),
    }
  }

  private getDimensionListData(data: Partial<ElConfigShape>): TooltipDataShape {
    const {dimension} = getAttr(data.source, 0, {}),
      backups = this.options.getLayersBackupData()

    return {
      title: dimension,
      list: backups
        .filter(({source}) => ungroup(source)?.dimension === dimension)
        .flatMap(
          ({source, fill, stroke}) =>
            source?.flatMap((item, i) =>
              group(item).map(({category, value}) => ({
                color: getAttr(fill, i, '') || getAttr(stroke, i, ''),
                label: category,
                value,
              }))
            ) ?? []
        ),
    }
  }

  private getCategoryListData(data: Partial<ElConfigShape>): TooltipDataShape {
    const {category} = getAttr(data.source, 0, {}),
      backups = this.options.getLayersBackupData(),
      groups = backups.flatMap(({source}) =>
        source?.filter((item) => ungroup(item)?.category === category)
      )

    return {
      title: ungroup(groups)?.category,
      list: groups.map((item, i) => ({
        color: getAttr(data.fill, i, '') || getAttr(data.stroke, i, ''),
        label: ungroup(item)?.dimension,
        value: ungroup(item)?.value,
      })),
    }
  }

  update({data}: {data: Partial<ElConfigShape>}) {
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

  move({pageX, pageY}: MouseEvent) {
    const rect = this.instance.node().getBoundingClientRect()
    const drift = 10

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
    this.data = null
    this.isAvailable = false
    this.instance.remove()
  }
}
