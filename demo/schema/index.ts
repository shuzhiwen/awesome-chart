import base from './base'
import line from './normal/line'
import rect from './normal/rect'
import pie from './normal/pie'
import radar from './normal/radar'
import scatter from './normal/scatter'
import matrix from './normal/matrix'
import digitalFlop from './form-control/digital-flop'
import tabMenu from './form-control/tab-menu'
import timeline from './form-control/timeline'
import map from './geography/map'
import dashboard from './normal/dashboard'
import indicator from './form-control/indicator'
import edgeBundle from './relation/edge-bundle'
import chord from './relation/chord'
import sankey from './relation/sankey'
import tree from './relation/tree'
import treemap from './relation/treemap'
import pack from './relation/pack'
import {debugRectLayer} from '../debug'
import {Chart} from '../../src'

export interface MenuItemShape {
  name: string
  schema: ReturnType<typeof base>
  debuggers?: ((chart: Chart) => void)[]
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
      name: '测试',
      children: [
        {
          name: '基础文字',
          debuggers: [debugRectLayer],
          schema: base([
            {
              type: 'text',
              options: {
                id: 'title',
                layout: 'container',
              },
              data: '测试文本',
              style: {
                text: {
                  fill: 'white',
                  fontSize: 50,
                },
              },
              animation: {
                text: {
                  enter: {
                    type: 'fade',
                  },
                },
              },
            },
          ]),
        },
      ],
    },
    {
      name: '折线图',
      children: [
        {
          name: '分组折线',
          schema: base(line({mode: 'default', hasArea: false, curve: 'curveLinear'})),
        },
        {
          name: '堆叠折线',
          schema: base(line({mode: 'stack', hasArea: false, curve: 'curveLinear'})),
        },
        {
          name: '分组面积',
          schema: base(line({mode: 'default', hasArea: true, curve: 'curveMonotoneX'})),
        },
        {
          name: '堆叠面积',
          schema: base(line({mode: 'stack', hasArea: true, curve: 'curveMonotoneX'})),
        },
        {
          name: '阶梯折线',
          schema: base(line({mode: 'default', hasArea: false, curve: 'curveStep'})),
        },
      ],
    },
    {
      name: '柱状图',
      children: [
        {
          name: '分组柱状',
          schema: base(rect({type: 'column', mode: 'group'})),
        },
        {
          name: '堆叠柱状',
          schema: base(rect({type: 'column', mode: 'stack'})),
        },
        {
          name: '区间柱状',
          schema: base(rect({type: 'column', mode: 'interval'})),
        },
        {
          name: '瀑布柱状',
          schema: base(rect({type: 'column', mode: 'waterfall'})),
        },
        {
          name: '百分比柱状',
          schema: base(rect({type: 'column', mode: 'percentage'})),
        },
      ],
    },
    {
      name: '条形图',
      children: [
        {
          name: '分组条形',
          schema: base(rect({type: 'bar', mode: 'group'})),
        },
        {
          name: '堆叠条形',
          schema: base(rect({type: 'bar', mode: 'stack'})),
        },
        {
          name: '区间条形',
          schema: base(rect({type: 'bar', mode: 'interval'})),
        },
        {
          name: '瀑布条形',
          schema: base(rect({type: 'bar', mode: 'waterfall'})),
        },
        {
          name: '百分比条形',
          schema: base(rect({type: 'bar', mode: 'percentage'})),
        },
      ],
    },
    {
      name: '饼图',
      children: [
        {
          name: '基础饼图',
          schema: base(pie({type: 'pie', mode: 'default', innerRadius: 0})),
        },
        {
          name: '基础环图',
          schema: base(pie({type: 'pie', mode: 'default', innerRadius: 30})),
        },
        {
          name: '南丁格尔玫瑰',
          schema: base(pie({type: 'nightingaleRose', mode: 'default', innerRadius: 30})),
        },
        {
          name: '堆叠南丁格尔玫瑰',
          schema: base(pie({type: 'nightingaleRose', mode: 'stack', innerRadius: 30})),
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
      name: '散点图',
      children: [
        {
          name: '基础散点',
          schema: base(scatter({pointSize: [10, 10]})),
        },
        {
          name: '气泡',
          schema: base(scatter({pointSize: [10, 30]})),
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
      ],
    },
    {
      name: '关系图',
      children: [
        {
          name: '边缘捆图',
          schema: base(edgeBundle()),
        },
        {
          name: '和弦图',
          schema: base(chord()),
        },
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
      ],
    },
    {
      name: '仪表盘',
      children: [
        {
          name: '仪表盘',
          schema: base(dashboard({type: 'dashboard'})),
        },
        {
          name: '环形指标卡',
          schema: base(dashboard({type: 'indicator'})),
        },
      ],
    },
    {
      name: '翻牌器',
      children: [
        {
          name: '翻牌器1',
          schema: base(digitalFlop({mode: 'vertical'})),
        },
        {
          name: '翻牌器2',
          schema: base(digitalFlop({mode: 'flop'})),
        },
      ],
    },
    {
      name: '表单控件',
      children: [
        {
          name: '指标卡',
          schema: base(indicator()),
        },
        {
          name: '时间轴',
          schema: base(timeline()),
        },
        {
          name: '切换菜单',
          schema: base(tabMenu()),
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
  ],
}
