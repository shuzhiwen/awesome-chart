import {DemoLayersSchema} from '../base'

export default (): DemoLayersSchema => [
  {
    type: 'text',
    data: '丐版词云',
  },
  {
    type: 'pack',
    style: {
      variant: 'wordCloud',
      zoom: true,
    },
    data: [nodes, links],
  },
]

const nodes = [
  ['id', 'name', 'value'],
  ['n1', '碳酸氢钠', 1],
  ['n2', '二氧化硅', 2],
  ['n3', '硫酸', 3],
  ['n4', '硫磺', 4],
  ['n5', '朱砂', 5],
  ['n6', '水银', 6],
  ['n7', '二硫碘化钾', 7],
  ['n8', '硼酸', 8],
  ['n9', '一氧化碳', 9],
  ['n10', '朱砂', 10],
  ['n11', '水银', 11],
  ['n12', '二硫碘化钾', 12],
  ['n13', '硼酸', 13],
  ['n14', '一氧化碳', 14],
  ['n15', '一氧化碳', 15],
  ['n16', '一氧化碳', 16],
  ['n17', '一氧化碳', 17],
  ['n18', '一氧化碳', 18],
  ['n19', '一氧化碳', 19],
]

const links = [['from', 'to']]
