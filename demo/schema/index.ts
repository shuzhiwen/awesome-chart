import base from './base'
import line from './normal/line'
import rect from './normal/rect'
import pie from './normal/pie'
import radar from './normal/radar'
import scatter from './normal/scatter'
import matrix from './normal/matrix'
import digitalFlop from './indicator/digital-flop'
import map from './geography/map'
import dashboard from './indicator/dashboard'
import carousel from './indicator/carousel'
import wave from './indicator/wave'
import sankey from './relation/sankey'
import tree from './relation/tree'
import treemap from './relation/treemap'
import pack from './relation/pack'
import candle from './combine/candle'
import force from './relation/force'
import wordCloud from './relation/word-cloud'
import radial from './normal/radial'
import rectLine from './normal/rect-line'
import rich from './normal/rich'

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
      name: '基础',
      children: [
        {
          name: '栅格文本',
          schema: base(rich()),
        },
      ],
    },
    {
      name: '折线图',
      children: [
        {
          name: '分组折线',
          schema: base(line({mode: 'default', hasArea: false, curveType: 'curveLinear'})),
        },
        {
          name: '堆叠折线',
          schema: base(line({mode: 'stack', hasArea: false, curveType: 'curveLinear'})),
        },
        {
          name: '分组面积',
          schema: base(line({mode: 'default', hasArea: true, curveType: 'curveMonotoneX'})),
        },
        {
          name: '堆叠面积',
          schema: base(line({mode: 'stack', hasArea: true, curveType: 'curveMonotoneX'})),
        },
        {
          name: '阶梯折线',
          schema: base(line({mode: 'default', hasArea: false, curveType: 'curveStep'})),
        },
        {
          name: '带标记的折线图',
          schema: base(
            line({mode: 'default', hasArea: false, curveType: 'curveLinear', hasMark: true})
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
          schema: base(rect({variant: 'column', mode: 'interval'})),
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
          schema: base(rect({variant: 'column', mode: 'group', hasInteractive: true}), 'dimension'),
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
          schema: base(rect({variant: 'bar', mode: 'interval'})),
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
          name: '有序条形图',
          schema: base(rect({variant: 'bar', mode: 'group', sort: 'desc', updateDuration: 200})),
        },
        {
          name: '玉玦图',
          schema: base(radial()),
        },
        {
          name: '折线柱状图',
          schema: base(rectLine()),
        },
      ],
    },
    {
      name: '饼图',
      children: [
        {
          name: '基础饼图',
          schema: base(pie({variant: 'pie', mode: 'default', innerRadius: 0})),
        },
        {
          name: '基础环图',
          schema: base(pie({variant: 'pie', mode: 'default', innerRadius: 30})),
        },
        {
          name: '南丁格尔玫瑰',
          schema: base(pie({variant: 'nightingaleRose', mode: 'default', innerRadius: 30})),
        },
        {
          name: '堆叠南丁格尔玫瑰',
          schema: base(pie({variant: 'nightingaleRose', mode: 'stack', innerRadius: 30})),
        },
      ],
    },
    {
      name: '雷达图',
      children: [
        {
          name: '分组雷达',
          schema: base(radar({mode: 'default'})),
        },
        {
          name: '堆叠雷达',
          schema: base(radar({mode: 'stack'})),
        },
      ],
    },
    {
      name: 'K线图',
      children: [
        {
          name: '基础K线',
          schema: base(candle({})),
        },
      ],
    },
    {
      name: '散点图',
      children: [
        {
          name: '基础散点',
          schema: base(scatter({pointSize: [5, 5]})),
        },
        {
          name: '气泡',
          schema: base(scatter({pointSize: [5, 15]})),
        },
      ],
    },
    {
      name: '矩阵图',
      children: [
        {
          name: '方形矩阵',
          schema: base(matrix({shape: 'rect'})),
        },
        {
          name: '圆形矩阵',
          schema: base(matrix({shape: 'circle'})),
        },
        {
          name: '带笔刷的矩阵',
          schema: base(matrix({shape: 'rect', brush: true})),
        },
      ],
    },
    {
      name: '关系图',
      children: [
        {
          name: '桑基图',
          schema: base(sankey()),
        },
        {
          name: '树图',
          schema: base(tree()),
        },
        {
          name: '矩阵树图',
          schema: base(treemap()),
        },
        {
          name: '打包图',
          schema: base(pack()),
        },
        {
          name: '重力气泡图',
          schema: base(force()),
        },
        {
          name: '词云',
          schema: base(wordCloud()),
        },
      ],
    },
    {
      name: '指标系列',
      children: [
        {
          name: '仪表盘',
          schema: base(dashboard({type: 'dashboard'})),
        },
        {
          name: '环形指标卡',
          schema: base(dashboard({type: 'indicator'})),
        },
        {
          name: '水波球',
          schema: base(wave()),
        },
      ],
    },
    {
      name: '翻牌器',
      children: [
        {
          name: '翻牌器1',
          schema: base(digitalFlop({variant: 'vertical'})),
        },
        {
          name: '翻牌器2',
          schema: base(digitalFlop({variant: 'flop'})),
        },
      ],
    },
    {
      name: '二维地图',
      children: [
        {
          name: '基础地图',
          schema: base(map()),
        },
      ],
    },
    {
      name: '轮播图',
      children: [
        {
          name: '基础轮播',
          schema: base(carousel()),
        },
      ],
    },
  ],
}
