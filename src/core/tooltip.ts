import {select} from 'd3'
import {isEqual, merge, isNil} from 'lodash'
import {errorCatcher, createLog, getAttr, group, ungroup} from '../utils'
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
  readonly log = createLog(Tooltip.name)

  private instance: D3Selection

  private options = defaultOptions

  private data: Maybe<any> = null

  public isVisible = false

  public isAvailable = false

  constructor(options: TooltipOptions) {
    this.setOptions(options)

    const {container, backgroundColor, mode} = this.options

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

    this.getListData = errorCatcher(this.getListData.bind(this), (error) => {
      this.log.warn(`The layer does not support ${mode} mode`, error)
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
      {dimension, category} = getAttr(data.source, 0, {}),
      backups = this.options.getLayersBackupData()

    if (this.options.mode === 'single') {
      return {
        title: ungroup(data.source)?.dimension ?? '',
        list: group(data.source).map(({value, category}) => ({
          color: data.fill || data.stroke || '#000',
          label: category,
          value,
        })),
      }
    }

    if ((mode === 'dimension' && !dimension) || (mode === 'category' && !category))
      throw new Error()

    if (this.options.mode === 'dimension') {
      const groups = backups.filter(({source}) => ungroup(source)?.dimension === dimension)

      return {
        title: dimension!,
        list: groups.flatMap(
          ({source, fill, stroke}) =>
            source?.flatMap((item, i) =>
              group(item).map(({category, value}) => ({
                color: getAttr(fill, i, null) || getAttr(stroke, i, null) || '#000',
                label: category,
                value,
              }))
            ) ?? []
        ),
      }
    }

    if (this.options.mode === 'category' && category) {
      const groups = backups.flatMap(({source}) => {
        return source?.filter((item) => ungroup(item)?.category === category) ?? []
      })

      return {
        title: ungroup(groups)?.category ?? '',
        list: groups.map((item, i) => ({
          color: getAttr(data.fill, i, null) || getAttr(data.stroke, i, null) || '#000',
          label: ungroup(item)?.dimension,
          value: ungroup(item)?.value,
        })),
      }
    }
  }

  update({data}: {data: Partial<ElConfigShape>}) {
    if (!isNil(this.options.render)) {
      this.options.render(this.instance.node(), data)
      return
    }

    const {titleSize, pointSize, labelSize, valueSize, textColor, setTooltipData} = this.options
    let tooltipData = this.getListData(data)

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
