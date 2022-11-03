export default ({pointSize}) => [
  {
    type: 'text',
    options: {
      layout: 'container',
    },
    data: '散点气泡图',
    style: {
      text: {
        fontSize: 16,
      },
    },
  },
  {
    type: 'legend',
    options: {
      layout: 'container',
    },
    style: {
      align: 'end',
      verticalAlign: 'start',
      direction: 'horizontal',
      pointSize: 8,
      gap: [5, 10],
      text: {
        fontSize: 12,
      },
    },
  },
  {
    type: 'auxiliary',
    options: {
      layout: 'main',
      direction: 'horizontal',
    },
    data: [
      ['标签', '数值'],
      ['最大值', 150],
      ['最小值', 100],
    ],
    style: {
      labelPosition: 'right',
      line: {
        stroke: 'orange',
        strokeWidth: 2,
        dasharray: '10 5',
      },
      text: {
        fill: 'orange',
        fontSize: 8,
      },
    },
  },
  {
    type: 'auxiliary',
    options: {
      layout: 'main',
      direction: 'vertical',
    },
    data: [
      ['标签', '数值'],
      ['阈值', 400],
    ],
    style: {
      labelPosition: 'top',
      line: {
        stroke: 'orange',
        strokeWidth: 2,
        dasharray: '10 5',
      },
      text: {
        fill: 'orange',
        fontSize: 8,
      },
    },
  },
  {
    type: 'axis',
    options: {
      layout: 'main',
      coordinate: 'cartesian',
    },
    style: {},
  },
  {
    type: 'scatter',
    options: {
      layout: 'main',
      axis: 'main',
    },
    data: [
      ['category', 'x', 'y', 'value'],
      ['1985', 157.1, 40, 184.3],
      ['1990', 224.4, 158.8, 247.1],
      ['2000', 489.5, 169.3, 414.6],
      ['2005', 629.8, 112.5, 582.4],
      ['2007', 781.6, 113, 725.2],
      ['2009', 840.4, 161, 778.4],
      ['2011', 855.2, 238.7, 681],
      ['2013', 772.2, 230, 534.2],
      ['2015', 732.7, 162.7, 439.9],
      ['2016', 718.1, 141.2, 416.6],
    ],
    style: {
      pointSize,
      text: {
        hidden: true,
        fontSize: 10,
      },
    },
    animation: {
      point: {
        enter: {
          type: 'zoom',
          delay: 0,
          duration: 2000,
          mode: 'enlarge',
          direction: 'both',
        },
        loop: {
          type: 'fade',
          delay: 1000,
          duration: 2000,
          startOpacity: 1,
          endOpacity: 0,
          alternate: true,
        },
      },
      text: {
        enter: {
          type: 'fade',
          delay: 2000,
          duration: 1000,
          mode: 'fadeIn',
        },
      },
    },
  },
]
