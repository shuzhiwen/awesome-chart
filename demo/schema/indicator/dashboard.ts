const createDashboardData = (type) => {
  const value = Math.floor(Math.random() * 100)

  if (type === 'dashboard') {
    return {
      value,
      fragments: [
        {label: '低', start: 0, end: 30},
        {label: '中', start: 30, end: 60},
        {label: '高', start: 60, end: 100},
      ],
    }
  }
  return {
    value,
    fragments: [
      {label: '当前', start: 0, end: value},
      {label: '剩余', start: value, end: 100},
    ],
  }
}

const createDashBoardStyle = (type) => {
  if (type === 'dashboard') {
    return {
      tickSize: 10,
      valueText: {
        fontSize: 15,
      },
    }
  }
  return {
    step: [2, 10],
    startAngle: 0,
    endAngle: 360,
    arcWidth: 15,
    tickSize: 10,
    pointerSize: 5,
    tickLine: {
      hidden: true,
    },
    pointer: {
      hidden: true,
    },
    tickText: {
      hidden: true,
    },
    valueText: {
      fontSize: 15,
      offset: [0, 0],
    },
  }
}

export default ({type}) => [
  {
    type: 'text',
    options: {
      layout: 'container',
    },
    data: '仪表盘',
    style: {
      text: {
        fontSize: 16,
      },
    },
  },
  {
    type: 'dashboard',
    options: {
      layout: 'main',
    },
    data: createDashboardData(type),
    style: createDashBoardStyle(type),
  },
]
