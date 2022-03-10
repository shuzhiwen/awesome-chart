type AnyObject = Record<string, any>

type AnyEventObject = Record<string, Function>

type Maybe<T> = T | null | undefined

type MaybeGroup<T> = T | T[] | null | undefined

type Padding = [number, number, number, number]

type ArrayItem<T> = T extends Array<infer U> ? U : T

type Engine = 'svg' | 'canvas'

type Direction = 'horizontal' | 'vertical'

type Align = 'start' | 'middle' | 'end'

type Coordinate = 'geographic' | 'cartesian' | 'polar'

type Position2 = 'inner' | 'outer'

type Position5 = 'center' | 'top' | 'right' | 'bottom' | 'left'

type Position9 = Position5 | 'left-top' | 'left-bottom' | 'right-top' | 'right-bottom'
