import {DemoLayersSchema} from '../base'

const images = [
  ['url'],
  [
    'https://img2.baidu.com/it/u=2221340107,3540408030&fm=253&fmt=auto&app=138&f=JPEG?w=784&h=500',
  ],
  ['https://t7.baidu.com/it/u=1732966997,2981886582&fm=193&f=GIF'],
]

export default ({mode}: {mode: 'slide' | 'fade'}): DemoLayersSchema => [
  {
    type: 'text',
    data: '轮播图',
  },
  {
    type: 'carousel',
    data: images,
    style: {
      mode,
      dot: {
        fill: 'orange',
      },
    },
  },
]
