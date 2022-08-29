type Meta = number | string

type AnyObject = Record<string, any>

type UnknownObject = Record<string, unknown>

type AnyFunction<T = unknown> = (...args: any) => T

type AnyEventObject = Record<string, AnyFunction>

type Maybe<T> = T | null | undefined

type MaybeGroup<T> = T | T[] | null | undefined

type Ungroup<T> = T extends Array<infer F> ? Ungroup<F> : T

type Padding = [number, number, number, number]

type SetKeys<T> = T extends Set<infer P> ? P : T

type ArrayItem<T> = T extends Array<infer U> ? U : T

type Values<T> = T extends Record<any, infer U> ? U : T extends Array<infer F> ? F : T

type FlatObject<T> = T extends Partial<Record<infer F, unknown>> ? {[Q in F]?: Ungroup<T[Q]>} : T

type Newable<T, P = never, F = never, Q = never> = {new (arg0: P, arg1: F, arg2: Q): T}

type Engine = 'svg' | 'canvas'

type Direction = 'horizontal' | 'vertical'

type Align = 'start' | 'middle' | 'end'

type Coordinate = 'geographic' | 'cartesian' | 'polar'

type Position2 = 'inner' | 'outer'

type Position4 = 'top' | 'right' | 'bottom' | 'left'

type Position5 = Position4 | 'center'

type Position9 = Position5 | 'leftTop' | 'leftBottom' | 'rightTop' | 'rightBottom'

type Priority = 'topHigh' | 'topLow' | 'bottomHigh' | 'bottomLow' | 'other'
