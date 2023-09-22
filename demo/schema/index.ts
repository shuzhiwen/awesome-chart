import base from './base'
import candle from './combine/candle'
import animation from './customize/animation'
import facet from './customize/facet'
import histogram from './customize/histogram'
import mapping from './customize/mapping'
import rich from './customize/rich'
import carousel from './display/carousel'
import dashboard from './display/dashboard'
import digitalFlop from './display/digital-flop'
import grid from './display/grid'
import wave from './display/wave'
import map from './geography/map'
import line from './normal/line'
import matrix from './normal/matrix'
import pie from './normal/pie'
import race from './normal/race'
import radar from './normal/radar'
import radial from './normal/radial'
import rect from './normal/rect'
import rectLine from './normal/rect-line'
import scatter from './normal/scatter'
import chord from './relation/chord'
import force from './relation/force'
import pack from './relation/pack'
import sankey from './relation/sankey'
import tree from './relation/tree'
import treemap from './relation/treemap'
import wordCloud from './relation/word-cloud'

const noPadding: Padding = [0, 0, 0, 0]
const smallPadding: Padding = [30, 30, 30, 30]

export interface MenuItemShape {
  name: string
  schema: ReturnType<typeof base>
}

export interface MenuShape {
  name: string
  children: {
    name: string
    children: MenuItemShape[]
  }[]
}

export const schemaMenu: MenuShape = {
  name: 'root',
  children: [
    {
      name: '自定义',
      children: [
        {
          name: '栅格文本',
          schema: base(rich()),
        },
        {
          name: '直方图',
          schema: base(histogram({variant: 'column'})),
        },
        {
          name: '高级绘制函数',
          schema: base(mapping(), {
            tooltipOptions: {
              render: `(container) => {
                const image = document.createElement('img')
                image.src = 'fruits.png'
                image.width = 100
                image.height = 100
                container.innerHTML = ''
                container.appendChild(image)
              }`,
            },
          }),
        },
        {
          name: '动画队列',
          schema: base(animation()),
        },
        {
          name: '分面图',
          schema: base(facet(), {
            facet: {row: 2, column: 2, gap: ['5%', '2%']},
            padding: [15, 120, 15, 15],
          }),
        },
      ],
    },
    {
      name: '折线图',
      children: [
        {
          name: '分组折线',
          schema: base(
            line({mode: 'default', hasArea: false, curveType: 'curveLinear'})
          ),
        },
        {
          name: '堆叠折线',
          schema: base(
            line({mode: 'stack', hasArea: false, curveType: 'curveLinear'})
          ),
        },
        {
          name: '分组面积',
          schema: base(
            line({mode: 'default', hasArea: true, curveType: 'curveMonotoneX'})
          ),
        },
        {
          name: '堆叠面积',
          schema: base(
            line({mode: 'stack', hasArea: true, curveType: 'curveMonotoneX'})
          ),
        },
        {
          name: '阶梯折线',
          schema: base(
            line({mode: 'stack', hasArea: false, curveType: 'curveStep'})
          ),
        },
        {
          name: '带标记的折线图',
          schema: base(
            line({
              mode: 'default',
              hasArea: false,
              curveType: 'curveMonotoneX',
              hasMark: true,
            })
          ),
        },
      ],
    },
    {
      name: '柱状图',
      children: [
        {
          name: '分组柱状',
          schema: base(rect({variant: 'column', mode: 'group'})),
        },
        {
          name: '堆叠柱状',
          schema: base(rect({variant: 'column', mode: 'stack'})),
        },
        {
          name: '区间柱状',
          schema: base(rect({variant: 'column', mode: 'interval'}), {
            tooltipOptions: {mode: 'single'},
          }),
        },
        {
          name: '瀑布柱状',
          schema: base(rect({variant: 'column', mode: 'waterfall'})),
        },
        {
          name: '百分比柱状',
          schema: base(rect({variant: 'column', mode: 'percentage'})),
        },
        {
          name: '带轴交互的柱状图',
          schema: base(
            rect({variant: 'column', mode: 'group', hasInteractive: true}),
            {
              tooltipOptions: {
                mode: 'dimension',
              },
            }
          ),
        },
        {
          name: '折线柱状图',
          schema: base(rectLine()),
        },
      ],
    },
    {
      name: '条形图',
      children: [
        {
          name: '分组条形',
          schema: base(rect({variant: 'bar', mode: 'group'})),
        },
        {
          name: '堆叠条形',
          schema: base(rect({variant: 'bar', mode: 'stack'})),
        },
        {
          name: '区间条形',
          schema: base(rect({variant: 'bar', mode: 'interval'}), {
            tooltipOptions: {mode: 'single'},
          }),
        },
        {
          name: '瀑布条形',
          schema: base(rect({variant: 'bar', mode: 'waterfall'})),
        },
        {
          name: '百分比条形',
          schema: base(rect({variant: 'bar', mode: 'percentage'})),
        },
        {
          name: '动态条形图',
          schema: base(race()),
        },
        {
          name: '玉玦图',
          schema: base(radial(), {padding: smallPadding}),
        },
      ],
    },
    {
      name: '饼图',
      children: [
        {
          name: '基础饼图',
          schema: base(pie({variant: 'pie', innerRadius: 0}), {
            padding: [30, 80, 30, 30],
          }),
        },
        {
          name: '基础环图',
          schema: base(
            pie({variant: 'pie', innerRadius: 30, hasGuideLine: true}),
            {
              padding: [30, 80, 30, 30],
            }
          ),
        },
        {
          name: '南丁格尔玫瑰',
          schema: base(pie({variant: 'nightingaleRose', innerRadius: 10}), {
            padding: [30, 80, 30, 30],
          }),
        },
        {
          name: '堆叠南丁格尔玫瑰',
          schema: base(
            pie({variant: 'nightingaleRose', innerRadius: 10, stack: true}),
            {
              padding: [30, 80, 30, 30],
            }
          ),
        },
      ],
    },
    {
      name: '雷达图',
      children: [
        {
          name: '分组雷达',
          schema: base(radar({mode: 'default'}), {padding: smallPadding}),
        },
        {
          name: '堆叠雷达',
          schema: base(radar({mode: 'stack'}), {padding: smallPadding}),
        },
      ],
    },
    {
      name: 'K线图',
      children: [
        {
          name: '基础K线',
          schema: base(candle(), {hasBrush: true}),
        },
      ],
    },
    {
      name: '散点图',
      children: [
        {
          name: '基础散点',
          schema: base(scatter({pointSize: [5, 5]}), {
            tooltipOptions: {mode: 'single'},
          }),
        },
        {
          name: '气泡',
          schema: base(scatter({pointSize: [5, 15]}), {
            tooltipOptions: {mode: 'single'},
          }),
        },
      ],
    },
    {
      name: '矩阵图',
      children: [
        {
          name: '方形矩阵',
          schema: base(matrix({shape: 'rect'}), {
            tooltipOptions: {mode: 'single'},
          }),
        },
        {
          name: '圆形矩阵',
          schema: base(matrix({shape: 'circle'}), {
            tooltipOptions: {mode: 'single'},
          }),
        },
        {
          name: '带笔刷的矩阵',
          schema: base(matrix({shape: 'rect', brush: true}), {
            hasBrush: true,
            tooltipOptions: {mode: 'single'},
          }),
        },
      ],
    },
    {
      name: '关系图',
      children: [
        {
          name: '桑基图',
          schema: base(sankey(), {padding: smallPadding}),
        },
        {
          name: '树图',
          schema: base(tree(), {padding: [30, 60, 30, 60]}),
        },
        {
          name: '矩阵树图',
          schema: base(treemap(), {padding: smallPadding}),
        },
        {
          name: '打包图',
          schema: base(pack(), {padding: smallPadding}),
        },
        {
          name: '重力气泡图',
          schema: base(force(), {padding: smallPadding}),
        },
        {
          name: '词云',
          schema: base(wordCloud(), {padding: smallPadding}),
        },
        {
          name: '和弦图',
          schema: base(chord()),
        },
      ],
    },
    {
      name: '指标系列',
      children: [
        {
          name: '仪表盘',
          schema: base(dashboard({type: 'dashboard'}), {padding: smallPadding}),
        },
        {
          name: '环形指标卡',
          schema: base(dashboard({type: 'indicator'}), {padding: smallPadding}),
        },
        {
          name: '水波球',
          schema: base(wave(), {padding: smallPadding}),
        },
      ],
    },
    {
      name: '翻牌器',
      children: [
        {
          name: '滚动翻牌器',
          schema: base(digitalFlop({variant: 'vertical'}), {
            padding: noPadding,
          }),
        },
        {
          name: '折叠翻牌器',
          schema: base(digitalFlop({variant: 'flop'}), {padding: noPadding}),
        },
      ],
    },
    {
      name: '二维地图',
      children: [
        {
          name: '基础地图',
          schema: base(map(), {padding: noPadding}),
        },
      ],
    },
    {
      name: '轮播图',
      children: [
        {
          name: '滑动轮播',
          schema: base(carousel({mode: 'slide'}), {padding: [30, 0, 0, 0]}),
        },
        {
          name: '淡入淡出轮播',
          schema: base(carousel({mode: 'fade'}), {padding: [30, 0, 0, 0]}),
        },
      ],
    },
    {
      name: '网格布局',
      children: [
        {
          name: '基础网格',
          schema: base(grid({placeMode: 'collision'})),
        },
        {
          name: '随机网格',
          schema: base(grid({placeMode: 'position'})),
        },
      ],
    },
  ],
}
