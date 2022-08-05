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
      id: 'title',
      layout: 'container',
    },
    data: '轮播图',
    style: {
      text: {
        fontSize: 16,
      },
    },
  },
  {
    type: 'carousel',
    options: {
      id: 'carousel',
      layout: 'main',
    },
    data: images,
    style: {},
  },
]
