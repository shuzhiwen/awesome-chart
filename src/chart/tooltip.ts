import {select} from 'd3'
import {createLog, getAttr, group, ungroup} from '../utils'
import {isEqual, merge, isNil} from 'lodash'
import {
  ElConfigShape,
  D3Selection,
  BackupDataShape,
  TooltipOptions,
  TooltipDataShape,
} from '../types'

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
  readonly log = createLog(Tooltip.name)

  private instance: D3Selection

  private options = defaultOptions

  private data: Maybe<any> = null

  public isVisible = false

  public isAvailable = false

  constructor(options: TooltipOptions) {
    this.setOptions(options)
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

  setOptions(options: Partial<TooltipOptions>) {
    this.options = merge({}, this.options, options)
  }

  private getListData<T>(
    data: Partial<ElConfigShape>,
    backup: BackupDataShape<T>
  ): TooltipDataShape {
    try {
      if (this.options.mode === 'single') {
        const {fill, stroke, source = {}} = data,
          color = fill || stroke || '#000'

        return {
          title: ungroup(source)?.dimension ?? '',
          list: group(source).map(({value, category: label}) => ({color, label, value})),
        }
      }

      if (this.options.mode === 'dimension') {
        const {dimension} = getAttr(data.source, 0, {}),
          sublayer = data.className?.split('-').at(-1) ?? '',
          groups = backup[sublayer].filter(({source}) => source?.at(0)?.dimension === dimension),
          {source, fill, stroke} = groups[0]

        return {
          title: dimension ?? '',
          list: (source ?? []).map((item, i) => ({
            color: getAttr(fill, i, null) || getAttr(stroke, i, null) || '#000',
            label: item.category,
            value: item.value,
          })),
        }
      }

      if (this.options.mode === 'category') {
        const {category} = getAttr(data.source, 0, {}),
          sublayer = data.className?.split('-').at(-1) ?? '',
          groups = backup[sublayer]
            .map(({source}) => source?.filter((item) => item.category === category) ?? [])
            .reduce((prev, cur) => [...prev, ...cur], [])

        return {
          title: groups.at(0)?.category ?? '',
          list: groups.map((item, i) => ({
            color: getAttr(data.fill, i, null) || getAttr(data.stroke, i, null) || '#000',
            label: item.dimension,
            value: item.value,
          })),
        }
      }
    } catch (error) {
      this.log.warn(`The layer does not support ${this.options.mode} mode`, error)
    }
  }

  update<T>({data, backup = {}}: {data: Partial<ElConfigShape>; backup?: BackupDataShape<T>}) {
    if (!isNil(this.options.render)) {
      this.options.render(this.instance.node(), data)
      return
    }

    const {titleSize, pointSize, labelSize, valueSize, textColor, setTooltipData} = this.options
    let tooltipData = this.getListData(data, backup)

    if (setTooltipData) {
      tooltipData = setTooltipData(tooltipData, this.options)
    }

    if (tooltipData && !isEqual(this.data, tooltipData)) {
      this.data = tooltipData
      this.instance
        .selectAll('.tooltip-title')
        .data([tooltipData.title])
        .join('div')
        .attr('class', 'tooltip-title')
        .style('display', (d) => (d ? 'block' : 'none'))
        .style('font-size', `${titleSize}px`)
        .style('color', textColor)
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
        .data(tooltipData.list)
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
        .style('background-color', (d) => d.color ?? '')
      pointWidthLabel
        .append('span')
        .style('white-space', 'nowrap')
        .style('font-size', `${labelSize}px`)
        .style('color', textColor)
        .text((d) => d.label ?? '')
      rows
        .append('span')
        .style('white-space', 'nowrap')
        .style('font-weight', 'bold')
        .style('font-size', `${valueSize}px`)
        .style('color', textColor)
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
