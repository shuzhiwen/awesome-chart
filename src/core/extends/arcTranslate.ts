import {range, sum} from 'd3'
import {noChange} from '../..'

function matrixMultiply(m1: number[][], m2: number[][]) {
  return m1.map((row) => {
    return range(0, m2[0].length).map((i) => {
      return sum(row.map((item, j) => item * m2[j][i]))
    })
  })
}

function computeAngle(v1: Vec2, v2: Vec2) {
  const {acos, sqrt, sign} = Math
  const [ux, uy, vx, vy] = [...v1, ...v2]
  return (
    sign(ux * vy - uy * vx) *
    acos((ux * vx + uy * vy) / (sqrt(ux ** 2 + uy ** 2) * (vx ** 2 + vy ** 2)))
  )
}

/**
 * Convert the arc parameter of svg to the arc parameter of canvas.
 * @see https://www.w3.org/TR/SVG11/implnote.html#ArcImplementationNotes
 */
export function svgArcToCanvas(
  x1: number,
  y1: number,
  rx: number,
  ry: number,
  φ: number,
  fA: number,
  fS: number,
  x2: number,
  y2: number
) {
  const {cos, sin, sqrt, PI} = Math
  const [x1_, y1_] = matrixMultiply(
    [
      [cos(φ), sin(φ)],
      [-sin(φ), cos(φ)],
    ],
    [[(x1 - x2) / 2], [(y1 - y2) / 2]]
  ).flatMap(noChange)
  const coefficient = sqrt(
    ((rx * ry) ** 2 - (rx * y1_) ** 2 - (ry * x1_) ** 2) /
      ((rx * y1_) ** 2 + (ry * x1_) ** 2)
  )
  const [cx_, cy_] = [(rx * y1_) / ry, (-ry * x1_) / rx].map(
    (item) => (fA !== fS ? 1 : -1) * item * coefficient
  )
  const [cx, cy] = matrixMultiply(
    [
      [cos(φ), -sin(φ)],
      [sin(φ), cos(φ)],
    ],
    [[cx_], [cy_]]
  ).flatMap((item, i) => item[0] + (i === 0 ? (x1 + x2) / 2 : (y1 + y2) / 2))
  const θ1 = computeAngle([1, 0], [(x1_ - cx_) / rx, (y1_ - cy_) / ry])
  const Δθ_ =
    computeAngle(
      [(x1_ - cx_) / rx, (y1_ - cy_) / ry],
      [(-x1_ - cx_) / rx, (-y1_ - cy_) / ry]
    ) %
    (PI * 2)
  const Δθ =
    Δθ_ + (fS === 0 && Δθ_ > 0 ? -PI * 2 : fS === 1 && Δθ_ < 0 ? PI * 2 : 0)

  return [cx, cy, (rx + ry) / 2, θ1, θ1 + Δθ, !fS] as const
}
