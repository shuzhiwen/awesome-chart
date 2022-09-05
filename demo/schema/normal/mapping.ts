export default () =>
  [
    {
      type: 'text',
      options: {
        layout: 'container',
      },
      data: '柱状图',
      style: {
        text: {
          fontSize: 16,
        },
      },
    },
    {
      type: 'axis',
      options: {
        layout: 'main',
      },
      scale: {
        count: 5,
        zero: true,
        paddingInner: 0.382,
      },
      data: {
        titleX: '支出项目',
      },
      style: {},
    },
    {
      type: 'rect',
      options: {
        layout: 'main',
        axis: 'main',
      },
      data: [
        ['支出项', '数量'],
        ['房租', 2000],
        ['饮食', 2500],
        ['服装', 500],
        ['总计', 5000],
      ],
      style: {
        background: {
          fill: 'gray',
          fillOpacity: 0.3,
        },
        rect: {
          fill: 'seagreen',
          mapping: ({source: {value}}) => {
            if (value > 4000) {
              return {
                fill: 'red',
              }
            }
          },
        },
        text: {
          fontSize: 10,
          format: {
            decimals: 2,
          },
        },
      },
    },
  ].filter(Boolean)
