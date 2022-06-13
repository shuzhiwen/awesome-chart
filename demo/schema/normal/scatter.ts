export default ({pointSize}) => [
  {
    type: 'text',
    options: {
      id: 'title',
      layout: 'container',
    },
    data: '气泡图',
    style: {
      text: {
        fontSize: 16,
      },
    },
  },
  {
    type: 'legend',
    options: {
      id: 'legend',
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
        // fill: 'red',
      },
    },
  },
  {
    type: 'auxiliary',
    options: {
      id: 'auxiliary1',
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
        stroke: 'yellow',
        strokeWidth: 2,
        dasharray: '10 5',
      },
      text: {
        fill: 'yellow',
        fontSize: 8,
      },
    },
  },
  {
    type: 'auxiliary',
    options: {
      id: 'auxiliary2',
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
        stroke: 'yellow',
        strokeWidth: 2,
        dasharray: '10 5',
      },
      text: {
        fill: 'yellow',
        fontSize: 8,
      },
    },
  },
  {
    type: 'axis',
    options: {
      id: 'axis',
      layout: 'main',
      coordinate: 'cartesian',
    },
    style: {},
  },
  {
    type: 'scatter',
    options: {
      id: 'scatter',
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
        hide: true,
        fontSize: 10,
      },
    },
    animation: {
      circle: {
        enter: {
          type: 'zoom',
          delay: 0,
          duration: 2000,
          mode: 'enlarge',
          direction: 'both',
        },
        loop: {
          type: 'scan',
          delay: 1000,
          duration: 3000,
          color: 'rgba(255,255,255,0.5)',
          direction: 'outer',
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
    event: {
      'click-circle': (d) => console.log(d),
    },
  },
]
