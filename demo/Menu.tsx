import {hierarchy, select} from 'd3'
import {cloneDeep, max, merge} from 'lodash'
import {CSSProperties, useEffect, useRef} from 'react'
import {
  addStyle,
  Chart,
  createData,
  DataBase,
  EventManager,
  getAttr,
  isSC,
  LayerBase,
  LayerDict,
  registerCustomLayer,
  robustRange,
  uuid,
} from '../src'
import {D3Selection, LayerOptions} from '../src/types'
import {schemaMenu} from './schema'

type MenuItem = {
  name: Meta
  schema?: AnyObject
  children?: MenuItem[]
}

type TabMenuStyleShape = Partial<
  Record<'active' | 'inactive' | 'text' | 'group', AnyObject> & {
    adsorb: boolean
  }
>

declare module '../src' {
  interface LayerDict {
    tabMenu: LayerTabMenu
  }
}

const defaultStyle: TabMenuStyleShape = {
  adsorb: true,
  active: {
    color: 'white',
    backgroundColor: 'rgb(0,119,255)',
  },
  inactive: {
    color: 'black',
    backgroundColor: 'rgb(255,255,255,.2)',
  },
  text: {
    fontSize: '14px',
    padding: '10px 0',
    height: '20px',
  },
  group: {
    alignContent: 'start',
    width: ['100px', '150px'],
    height: ['auto', 'fit-content'],
    backgroundColor: 'whitesmoke',
    boxSizing: 'border-box',
    border: 'solid lightgray 1px',
    pointerEvents: 'auto',
  },
}

class LayerTabMenu extends LayerBase<never> {
  readonly tabEvent = new EventManager<'click', AnyFunction>()

  private _data: Maybe<DataBase<MenuItem>>

  private _style = defaultStyle

  private activeNodes: any[] = []

  protected originTabData: any[] = []

  protected activeTabData: any[] = []

  get data() {
    return this._data
  }

  get style() {
    return this._style
  }

  constructor(options: LayerOptions) {
    super({options})

    const {left, top, width, height} = options.layout

    this.root = (this.root as D3Selection)
      .append('foreignObject')
      .attr('width', width)
      .attr('height', height)
      .append('xhtml:div')
      .style('width', `${width}px`)
      .style('height', `${height}px`)
      .style('margin-left', `${left}px`)
      .style('margin-top', `${top}px`)
      .style('display', 'flex')
      .on('mouseleave', () => this.blur())
  }

  blur() {
    this.activeNodes.map((node) => (node.isActive = false))
    this.activeNodes.length = 0
    this.needRecalculated = true
    this.draw()
  }

  setData(data: LayerTabMenu['data']) {
    this._data = createData('base', this.data, data)

    const tree = hierarchy(this.data?.source)
    const nodes = tree.descendants()
    const maxDepth = max(nodes.map(({depth}) => depth)) ?? 0

    // the root is not visible
    this.originTabData = robustRange(1, maxDepth, 1).map((depth) =>
      nodes.filter((node) => node.depth === depth)
    )
  }

  update() {
    const {width, height} = this.options.layout
    const {text, active, inactive} = this.style

    this.activeTabData = this.originTabData.slice(0, 1)

    for (let i = 0; i < this.originTabData.length - 1; i++) {
      // current level has active node
      if (this.activeNodes.length > i) {
        this.activeTabData[i + 1] = this.activeNodes[i].children || []
      }
    }

    // create drawable data
    this.activeTabData = this.activeTabData.map((group, i) => {
      const textStyle = cloneDeep(text ?? {})

      Object.entries(textStyle).forEach(
        ([key, value]) => (textStyle[key] = getAttr(value, i, undefined))
      )

      return group.map((item) => ({
        node: item,
        text: item.data.name,
        width: width / this.originTabData.length,
        height: height / group.length,
        ...merge(textStyle, item.data.style, item.isActive ? active : inactive),
      }))
    })
  }

  draw() {
    if (!isSC(this.root)) return

    this.root
      .selectAll('.group')
      .data(this.activeTabData)
      .join('xhtml:div')
      .attr('class', 'group')
      .style('display', 'flex')
      .style('overflow', 'scroll')
      .style('flex-direction', 'column')
      .each((groupData: any, index, groups) => {
        const groupEl = select(groups[index])
        addStyle(groupEl, this.style.group ?? {}, index)
        groupEl
          .selectAll('.item')
          .data(groupData)
          .join('xhtml:div')
          .attr('class', 'item')
          .style('display', 'grid')
          .style('place-items', 'center')
          .style('cursor', 'pointer')
          .each((itemData: any, itemIndex, items) => {
            const itemEl = select(items[itemIndex])
            addStyle(itemEl, itemData)
            itemEl.text(itemData.text)
          })
          .on('click', (event, data) =>
            this.tabEvent.fire('click', {data, event})
          )
          .on('mouseenter', (event, data: any) => {
            const {node} = data
            const {depth} = node
            this.activeNodes.length = depth
            this.activeNodes[depth - 1] = node
            // set active
            node.parent
              .descendants()
              .filter((child) => child.depth >= depth)
              .forEach((child) => (child.isActive = false))
            node.isActive = true
            node.event = event
            this.needRecalculated = true
            this.draw()
          })
      })
      // adsorb
      .each((_, index, groups) => {
        const nextGroup = groups[index + 1]
        const currentNode = this.activeNodes[index]

        if (this.style.adsorb && currentNode && nextGroup) {
          const nodeRect = currentNode.event.target.getBoundingClientRect()
          const groupRect = (nextGroup as any).getBoundingClientRect()

          if (nodeRect.y + groupRect.height > document.body.clientHeight) {
            select(nextGroup).style(
              'margin-top',
              `${nodeRect.y + nodeRect.height - groupRect.height}px`
            )
          } else {
            select(nextGroup).style('margin-top', `${nodeRect.y}px`)
          }
        }
      })
  }
}

if (!LayerDict['tabMenu']) {
  registerCustomLayer('tabMenu', LayerTabMenu)
}

export const Menu = (props: {onChange: (data: any) => void}) => {
  const ref = useRef<HTMLDivElement>(null)
  const {onChange} = props

  useEffect(() => {
    if (!ref.current) return

    const chart = new Chart({
      container: ref.current,
      padding: [0, 0, 0, 0],
    })
    const layer = chart.createLayer({
      id: uuid(),
      type: 'tabMenu',
      layout: chart.layout.container,
    })!

    layer.setData(new DataBase(schemaMenu))
    layer.draw()
    layer.tabEvent.onWithOff('click', 'user', ({data}) => {
      if (data.node.data.schema) {
        onChange(data.node.data.schema)
        layer.blur()
      }
    })
  }, [onChange])

  return (
    <div style={styles.container}>
      <div ref={ref} style={styles.menu} />
    </div>
  )
}

const styles: Record<'container' | 'menu', CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    width: 100,
  },
  menu: {
    zIndex: 1,
    width: 250,
    pointerEvents: 'none',
    height: window.innerHeight,
  },
}
