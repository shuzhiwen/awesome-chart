export default () => [
  {
    type: 'text',
    options: {
      layout: 'container',
    },
    data: '栅格文本',
  },
  {
    type: 'text',
    options: {
      layout: 'main',
    },
    data: [
      {
        text: '标签A',
        x: 0,
        y: 0,
      },
      {
        text: '标签ABC',
        x: 1,
        y: 0,
      },
      {
        text: '标签B',
        x: 2,
        y: 0,
      },
      {
        text: '说明A',
        x: 0,
        y: 2,
      },
      {
        text: '说明ABC',
        x: 1,
        y: 2,
      },
      {
        text: '说明B',
        x: 2,
        y: 2,
      },
      {
        text: 100,
        x: 0,
        y: 4,
      },
      {
        text: 2000,
        x: 1,
        y: 4,
      },
      {
        text: 30000,
        x: 2,
        y: 4,
      },
    ],
    style: {
      sanger: [3, 5],
      text: {
        fontSize: 16,
        align: ['middle', 'middle'],
      },
      groupText: [
        {
          fill: 'gray',
          align: ['start', 'middle'],
        },
        {},
        {
          fill: 'orange',
        },
        {},
        {
          fill: 'green',
          fontSize: 20,
          align: ['end', 'middle'],
        },
      ],
    },
  },
]
