type Meta = number | string

type AnyObject<T = any> = Record<string, T>

type AnyFunction = (...args: any) => any

type AnyEventObject = Record<string, AnyFunction>

type Maybe<T> = T | null | undefined

type MaybeGroup<T> = T | T[] | null | undefined

type Padding = [number, number, number, number]

type ArrayItem<T> = T extends Array<infer U> ? U : T

type Keys<T> = T extends Record<infer U, any> ? U : T

type Values<T> = T extends Record<any, infer U> ? U : T

type Engine = 'svg' | 'canvas'

type Direction = 'horizontal' | 'vertical'

type Align = 'start' | 'middle' | 'end'

type Coordinate = 'geographic' | 'cartesian' | 'polar'

type Position2 = 'inner' | 'outer'

type Position4 = 'top' | 'right' | 'bottom' | 'left'

type Position5 = Position4 | 'center'

type Position9 = Position5 | 'left-top' | 'left-bottom' | 'right-top' | 'right-bottom'
