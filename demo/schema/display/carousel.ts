const images = [
  ['url'],
  [
    'https://teletraan-project-static.s3.cn-northwest-1.amazonaws.com.cn/team/workbench/banner01.jpeg',
  ],
  [
    'https://teletraan-project-static.s3.cn-northwest-1.amazonaws.com.cn/team/workbench/banner02.jpeg',
  ],
  [
    'https://teletraan-project-static.s3.cn-northwest-1.amazonaws.com.cn/team/workbench/banner03.jpeg',
  ],
  [
    'https://teletraan-project-static.s3.cn-northwest-1.amazonaws.com.cn/team/workbench/banner04.jpeg',
  ],
  [
    'https://teletraan-project-static.s3.cn-northwest-1.amazonaws.com.cn/team/workbench/banner05.jpeg',
  ],
  [
    'https://teletraan-project-static.s3.cn-northwest-1.amazonaws.com.cn/team/workbench/banner06.jpeg',
  ],
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
