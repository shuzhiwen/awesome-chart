const images = [
  ['url'],
  ['http://www.shuzhiwen.com:8001/picture/1.jpeg'],
  ['http://www.shuzhiwen.com:8001/picture/2.jpeg'],
  ['http://www.shuzhiwen.com:8001/picture/3.jpeg'],
  ['http://www.shuzhiwen.com:8001/picture/4.jpeg'],
  ['http://www.shuzhiwen.com:8001/picture/5.jpeg'],
]

export default () => [
  {
    type: 'text',
    options: {
      layout: 'container',
    },
    data: '轮播图',
  },
  {
    type: 'carousel',
    options: {
      layout: 'main',
    },
    data: images,
  },
]
