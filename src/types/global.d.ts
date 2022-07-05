type Meta = number | string

type AnyObject = Record<string, any>

type UnknownObject = Record<string, unknown>

type AnyFunction = (...args: any) => any

type AnyEventObject = Record<string, AnyFunction>

type Maybe<T> = T | null | undefined

type MaybeGroup<T> = T | T[] | null | undefined

type Ungroup<T> = T extends Array<infer F> ? Ungroup<F> : T

type Padding = [number, number, number, number]

type ArrayItem<T> = T extends Array<infer U> ? U : T

type Values<T> = T extends Record<any, infer U> ? U : T extends Array<infer F> ? F : T

type FlatObject<T> = T extends Record<infer F, MaybeGroup<infer P>> ? Record<F, P> : never

type Engine = 'svg' | 'canvas'

type Direction = 'horizontal' | 'vertical'

type Align = 'start' | 'middle' | 'end'

type Coordinate = 'geographic' | 'cartesian' | 'polar'

type Position2 = 'inner' | 'outer'

type Position4 = 'top' | 'right' | 'bottom' | 'left'

type Position5 = Position4 | 'center'

type Position9 = Position5 | 'leftTop' | 'leftBottom' | 'rightTop' | 'rightBottom'

type Priority = 'topHigh' | 'topLow' | 'bottomHigh' | 'bottomLow' | 'other'
