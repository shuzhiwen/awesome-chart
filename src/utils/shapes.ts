import {range} from 'd3'

export const createParallelogram = (
  left: number,
  top: number,
  width: number,
  height: number,
  angle = 45
) => [
  [left, top],
  [left + width, top],
  [left + width + Math.sin(angle) * height, top + height],
  [left + Math.sin(angle) * height, top + height],
]

export const createHexagon = (left: number, top: number, width: number, height: number) => [
  [left + width * 0.5, top],
  [left + width, top + height * 0.25],
  [left + width, top + height * 0.75],
  [left + width * 0.5, top + height],
  [left, top + height * 0.75],
  [left, top + height * 0.25],
]

export const createStar = (left: number, top: number, width: number, height: number) => [
  [
    left + width * 0.5 * (1 - Math.sin(Math.PI * 0.4)),
    top + height * 0.5 * (1 - Math.cos(Math.PI * 0.4)),
  ],
  [
    left + width * 0.5 * (1 + Math.sin(Math.PI * 0.4)),
    top + height * 0.5 * (1 - Math.cos(Math.PI * 0.4)),
  ],
  [
    left + width * 0.5 * (1 - Math.cos(Math.PI * 0.3)),
    top + height * 0.5 * (1 + Math.sin(Math.PI * 0.3)),
  ],
  [left + width * 0.5, top],
  [
    left + width * 0.5 * (1 + Math.cos(Math.PI * 0.3)),
    top + height * 0.5 * (1 + Math.sin(Math.PI * 0.3)),
  ],
]

export const createArrow = (
  left: number,
  top: number,
  width: number,
  height: number,
  direction: 'left' | 'right'
) => {
  switch (direction) {
    case 'left':
      return [
        [left + width, top],
        [left, top + height / 2],
        [left + width, top + height],
      ]
    case 'right':
      return [
        [left, top],
        [left + width, top + height / 2],
        [left, top + height],
      ]
    default:
      return []
  }
}

export const createKnuckle = (
  left: number,
  top: number,
  width: number,
  height: number,
  direction: 'left-top' | 'right-top' | 'right-bottom' | 'left-bottom'
) => {
  switch (direction) {
    case 'left-top':
      return [
        [left, top + height],
        [left, top],
        [left + width, top],
      ]
    case 'right-top':
      return [
        [left, top],
        [left + width, top],
        [left + width, top + height],
      ]
    case 'right-bottom':
      return [
        [left + width, top],
        [left + width, top + height],
        [left, top + height],
      ]
    case 'left-bottom':
      return [
        [left + width, top + height],
        [left, top + height],
        [left, top],
      ]
    default:
      return []
  }
}

export const createDroplet = (left: number, top: number, width: number, height: number) => {
  const r = height / 3,
    centerX = left + width / 2

  return [
    `M ${centerX},${top + height}`,
    `L ${centerX - (height * Math.sqrt(3)) / 6},${top + 1.5 * r}`,
    `A ${r},${r},0,1,1,${centerX + (height * Math.sqrt(3)) / 6},${top + 1.5 * r} Z`,
  ].join(' ')
}

export const createSinusoidal = (
  left: number,
  top: number,
  width: number,
  height: number,
  lengthen = 0
) => {
  const points = [
    [left, top + height * 0.5],
    [left + width * 0.25, top + height],
    [left + width * 0.5, top + height * 0.5],
    [left + width * 0.75, top],
    [left + width, top + height * 0.5],
  ]
  const leftExtendPoints = range(-lengthen, 0).flatMap((i) => [
    [points[(i % 2) * -2][0] + Math.floor((i - 1) / 2) * width, points[(i % 2) * -2][1]],
    [points[(i % 2) * -2 + 1][0] + Math.floor((i - 1) / 2) * width, points[(i % 2) * -2 + 1][1]],
  ])
  const rightExtendPoints = range(0, lengthen).flatMap((i) => [
    [points[(i % 2) * 2 + 1][0] + (Math.floor(i / 2) + 1) * width, points[(i % 2) * 2 + 1][1]],
    [points[(i % 2) * 2 + 2][0] + (Math.floor(i / 2) + 1) * width, points[(i % 2) * 2 + 2][1]],
  ])

  return [...leftExtendPoints, ...points, ...rightExtendPoints]
}
