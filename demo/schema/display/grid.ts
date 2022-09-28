export default () => [
  {
    type: 'text',
    options: {
      layout: 'container',
    },
    data: '堆叠网格布局',
    style: {
      text: {
        fontSize: 16,
      },
    },
  },
  {
    type: 'grid',
    options: {
      layout: 'main',
    },
    data: [
      ['width', 'height'],
      [3, 2],
      [1, 1],
      [2, 2],
      [3, 1],
      [1, 2],
      [1, 3],
      [1, 1],
      [3, 2],
      [8, 8],
      [2, 2],
    ],
    style: {},
    animation: {
      box: {
        enter: {
          type: 'zoom',
        },
      },
    },
  },
]
