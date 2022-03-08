const createDashboardData = (type) => {
  const value = Math.floor(Math.random() * 100)
  if (type === 'dashboard') {
    return {
      value,
      label: '仪表盘',
      fragments: [
        [0, 30, '低'],
        [30, 60, '中'],
        [60, 100, '高'],
      ],
    }
  }
  return {
    value,
    label: '环形指标卡',
    fragments: [
      [0, value, '当前'],
      [value, 100, '剩余'],
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
      hide: true,
    },
    pointer: {
      hide: true,
    },
    pointerAnchor: {
      hide: true,
    },
    tickText: {
      hide: true,
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
      id: 'title',
      layout: 'title',
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
      id: 'dashboard',
      layout: 'main',
    },
    data: createDashboardData(type),
    style: createDashBoardStyle(type),
  },
]
