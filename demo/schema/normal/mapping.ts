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
          opacity: 0,
          mapping: ({source: {value}, x, y, width, height, fill, container, theme, className}) => {
            const {drawLine} = (window as any).AWESOME_CHART.__awesome
            // replace label with image
            drawLine({
              data: [
                {
                  x1: x + width / 2,
                  y1: y,
                  x2: x + width / 2,
                  y2: y + height,
                },
              ],
              stroke: value > 4000 ? 'red' : fill,
              strokeWidth: width,
              strokeDasharray: '5 5',
              container,
              theme,
              className: `${className}-mapping-line`,
            })
          },
        },
        text: {
          fontSize: 10,
          opacity: 0,
          mapping: ({x, y, container, theme, className}) => {
            const {drawImage} = (window as any).AWESOME_CHART.__awesome
            // replace label with image
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
