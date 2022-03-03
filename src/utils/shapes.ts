// create a parallelogram with auto degree which not exceed the area
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

// create a hexagon which not exceed the area
export const createHexagon = (left: number, top: number, width: number, height: number) => [
  [left + width * 0.5, top],
  [left + width, top + height * 0.25],
  [left + width, top + height * 0.75],
  [left + width * 0.5, top + height],
  [left, top + height * 0.75],
  [left, top + height * 0.25],
]

// create a regular five-pointed star which not exceed the area
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

// create an arrow which not exceed the area
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

// create a knuckle which not exceed the area
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
