export default ({mode}) => [
  {
    type: 'text',
    options: {
      layout: 'container',
    },
    data: '饼图',
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
  },
  {
    type: 'axis',
    options: {
      layout: 'main',
      coordinate: 'polar',
    },
    scale: {
      count: 5,
      zero: false,
    },
    style: {},
  },
  {
    type: 'radar',
    options: {
      layout: 'main',
      axis: 'main',
      mode,
    },
    data: {
      type: 'tableList',
      mode: 'normal',
      row: 5,
      column: 2,
      mu: 500,
      sigma: 200,
      decimalPlace: 1,
    },
    style: {
      pointSize: 5,
      text: {
        hidden: true,
      },
    },
    animation: {
      polygon: {
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
      point: {
        enter: {
          type: 'fade',
          delay: 2000,
          duration: 1000,
          mode: 'fadeIn',
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
