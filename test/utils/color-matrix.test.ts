import {ColorMatrix} from '../../src'

test('ColorMatrix', () => {
  const rawMatrix = [
    ['#ffff00', '#ffff01', '#ffff02', '#ffff03'],
    ['#ffff10', '#ffff11', '#ffff12', '#ffff13'],
    ['#ffff20', '#ffff21', '#ffff22', '#ffff23'],
    ['#ffff30', '#ffff31', '#ffff32', '#ffff33'],
  ]
  const colorMatrix = new ColorMatrix(rawMatrix)
  const emptyColorMatrix = new ColorMatrix([])

  // valid
  expect(colorMatrix.matrix).toEqual(rawMatrix)
  expect(colorMatrix.get(0, 0)).toBe(rawMatrix[0][0])
  expect(colorMatrix.get(1, 2)).toBe(rawMatrix[1][2])
  expect(colorMatrix.get(3, 1)).toBe(rawMatrix[3][1])

  // out of bound
  expect(colorMatrix.get(1, -1)).toBe(rawMatrix[1][3])
  expect(colorMatrix.get(2, -2)).toBe(rawMatrix[2][2])
  expect(colorMatrix.get(-1, -1)).toBe(rawMatrix[3][3])
  expect(colorMatrix.get(0, 5)).toBe(rawMatrix[0][1])
  expect(colorMatrix.get(4, 5)).toBe(rawMatrix[0][1])

  // out of bound with empty matrix
  expect(emptyColorMatrix.get(0, 0)).toBe(undefined)
  expect(emptyColorMatrix.get(-1, -1)).toBe(undefined)
})
