import {select} from 'd3'
import {createLog, getAttr, group, ungroup} from '../utils'
import {isEqual, isArray, merge, isFunction} from 'lodash'
import {ElConfigShape, D3Selection, BackupDataShape, TooltipOptions} from '../types'

const defaultOptions: Required<TooltipOptions> = {
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
  render: null,
}

export class Tooltip {
  readonly log = createLog(Tooltip.name)

  private instance: D3Selection

  private options = defaultOptions

  private backup: Maybe<any> = null

  public isVisible = false

  public isAvailable = false

  constructor(options: TooltipOptions) {
    this.options = merge({}, defaultOptions, options)
    const {container, backgroundColor} = this.options
    this.instance = select(container)
      .append('div')
      .attr('class', 'chart-tooltip')
      .style('border-radius', '2px')
      .style('position', 'fixed')
      .style('overflow', 'hidden')
      .style('display', 'none')
      .style('z-index', 999)
      .style('left', 0)
      .style('top', 0)
    // blurred background
    this.instance
      .append('div')
      .attr('class', 'chart-tooltip-bg')
      .style('filter', 'blur(1px)')
      .style('background-color', backgroundColor)
      .style('position', 'absolute')
      .style('width', '1000px')
      .style('height', '1000px')
  }

  show(event: MouseEvent) {
    this.isVisible = true
    this.instance?.style('display', 'block')
    event && this.move(event)
  }

  hide() {
    this.isVisible = false
    this.instance?.style('display', 'none')
  }

  private getListData<T>(data: ElConfigShape, backup: BackupDataShape<T>) {
    try {
      if (this.options.mode === 'single') {
        const {fill, stroke, source} = data,
          pointColor = ungroup(fill) || ungroup(stroke) || '#000'

        return group(source).map((item) => ({pointColor, ...item}))
      }

      if (this.options.mode === 'dimension') {
        const {dimension} = getAttr(data.source, 0, {}),
          elType = data.className.split('-').at(-1)!,
          groups = backup[elType].filter(({source}) => source?.[0].dimension === dimension),
          {source, fill, stroke} = groups[0]

        return source?.map((item, i) => ({
          pointColor: getAttr(fill, i, null) || getAttr(stroke, i, null) || '#000',
          ...item,
        }))
      }

      if (this.options.mode === 'category') {
        const {category} = getAttr(data.source, 0, {}),
          elType = data.className.split('-').at(-1)!,
          groups = backup[elType]
            .map(({source}) => source?.filter((item) => item.category === category))
            .reduce((prev, cur) => [...prev!, ...cur!], [])

        return groups?.map((item, i) => ({
          pointColor: getAttr(data.fill, i, null) || getAttr(data.stroke, i, null) || '#000',
          ...item,
        }))
      }
    } catch (error) {
      this.log.warn(`The layer does not support ${this.options.mode} mode`, error)
    }
  }

  update<T>({data, backup}: {data: ElConfigShape; backup: BackupDataShape<T>}) {
    if (isFunction(this.options.render)) {
      this.options.render(this.instance.node(), data, backup)
      return
    }

    const list = this.getListData(data, backup)
    const {titleSize, titleColor, pointSize, labelSize, labelColor, valueSize, valueColor} =
      this.options

    if (isArray(list) && !isEqual(this.backup, list)) {
      this.backup = list
      this.instance
        .selectAll('.chart-tooltip-title')
        .data([list[0]?.dimension])
        .join('div')
        .attr('class', 'chart-tooltip-title')
        .style('padding', '8px')
        .style('font-size', `${titleSize}px`)
        .style('color', titleColor)
        .style('position', 'relative')
        .text((d) => d!)
      const container = this.instance
        .selectAll('.chart-tooltip-content')
        .data([null])
        .join('div')
        .attr('class', 'chart-tooltip-content')
        .style('display', 'flex')
        .style('flex-direction', 'column')
        .style('justify-content', 'space-between')
        .style('align-items', 'center')
        .style('padding', `${list.length ? 8 : 0}px`)
        .style('padding-top', '0px')
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
        .append('div')
        .style('font-size', `${labelSize}px`)
        .style('color', labelColor)
        .text((d) => d.category!)
      rows
        .append('div')
        .style('font-weight', 'bold')
        .style('font-size', `${valueSize}px`)
        .style('color', valueColor)
        .text((d) => d.value!)
    }
  }

  move({pageX, pageY}: MouseEvent) {
    const drift = 10
    const rect = this.instance.node().getBoundingClientRect()

    // boundary judgement
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
    this.backup = null
    this.isAvailable = false
    this.instance.remove()
  }
}
