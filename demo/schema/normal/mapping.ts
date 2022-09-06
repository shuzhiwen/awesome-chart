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
        ['饮食', 2000],
        ['服装', 500],
        ['总计', 5000],
      ],
      style: {
        labelPosition: 'top',
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
          opacity: 0,
          mapping: ({x, y, drawImage, container, theme, className}) => {
            drawImage({
              data: [
                {
                  x,
                  y: y - 30,
                  width: 20,
                  height: 20,
                  url: 'https://gd-hbimg.huaban.com/e5d9c7bef5b12c17e5abc1d7d5bca561edc40e7e10b75-uDcLGk_fw658',
                },
              ],
              container,
              theme,
              className: `${className}-mapping-image`,
            })
          },
        },
      },
    },
  ].filter(Boolean)
