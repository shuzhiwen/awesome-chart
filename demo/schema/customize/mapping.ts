export default () => [
  {
    type: 'text',
    data: '柱状图',
  },
  {
    type: 'axis',
    scale: {
      zero: true,
    },
    style: {
      textX: {
        mapping: `(data) =>
          window.awesome.attachImageToElement({
            ...data,
            from: 'text',
            url: 'fruits.png',
            size: [30, 30],
            offset: [0, 25],
          })`,
      },
      axisLineX: {
        hidden: false,
        mapping: `(data) =>
          window.awesome.attachImageToElement({
            ...data,
            from: 'line',
            url: 'boll.gif',
            size: [30, 30],
            offset: [5, 0],
          })`,
      },
      axisLineY: {
        hidden: false,
        mapping: `(data) =>
          window.awesome.attachImageToElement({
            ...data,
            position: 'end',
            from: 'line',
            url: 'boll.gif',
            size: [30, 30],
            offset: [0, -5],
          })`,
      },
    },
  },
  {
    type: 'rect',
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
        mapping: `({
          source,
          x,
          y,
          width,
          height,
          fill,
          container,
          theme,
          className,
        }) => {
          window.awesome.drawLine({
            data: [
              {
                x1: x + width / 2,
                y1: y,
                x2: x + width / 2,
                y2: y + height,
              },
            ],
            stroke: source.meta.value > 4000 ? 'red' : fill,
            strokeWidth: width * 0.6,
            strokeDasharray: '5 5',
            container,
            theme,
            className: className + '-mapping-line',
          })
        }`,
      },
      text: {
        fontSize: 10,
        opacity: 0,
        mapping: `(data) => {
          const xIndex = Math.floor(Math.random() * 2)
          const yIndex = Math.floor(Math.random() * 2)
          const originImageSize = 200
          const imageItemSize = originImageSize / 2
          const labelIconSize = 30
          window.awesome.attachImageToElement({
            ...data,
            opacity: 1,
            from: 'text',
            url: 'fruits.png',
            size: [labelIconSize, labelIconSize],
            offset: [0, -10],
            viewBox: {
              x: xIndex * imageItemSize,
              y: yIndex * imageItemSize,
              width: imageItemSize,
              height: imageItemSize,
            },
          })
        }`,
      },
    },
  },
]
