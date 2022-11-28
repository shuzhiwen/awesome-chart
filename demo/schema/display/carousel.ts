const images = [
  ['url'],
  ['http://www.shuzhiwen.com:8001/picture/1.jpeg'],
  ['http://www.shuzhiwen.com:8001/picture/2.jpeg'],
  ['http://www.shuzhiwen.com:8001/picture/3.jpeg'],
  ['http://www.shuzhiwen.com:8001/picture/4.jpeg'],
  ['http://www.shuzhiwen.com:8001/picture/5.jpeg'],
]

export default ({mode}: {mode: 'slide' | 'fade'}) => [
  {
    type: 'text',
    data: '轮播图',
  },
  {
    type: 'carousel',
    options: {
      mode,
    },
    data: images,
    style: {
      dot: {
        fill: 'orange',
      },
    },
  },
]
