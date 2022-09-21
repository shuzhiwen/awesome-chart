type Meta = number | string

type Maybe<T> = T | null | undefined

type AnyObject = Record<string, any>

type UnknownObject = Record<string, unknown>

type Padding = [number, number, number, number]

type AnyFunction<T = unknown> = (...args: any) => T

type AnyEventObject = Record<string, AnyFunction>

type MaybeGroup<T> = T | T[] | null | undefined

type Ungroup<T> = T extends Array<infer F> ? Ungroup<F> : T

type SetKeys<T> = T extends Set<infer P> ? P : T

type ArrayItem<T> = T extends Array<infer U> ? U : T

type Values<T> = T extends Record<any, infer U> ? U : T extends Array<infer F> ? F : T

type Newable<T, Q> = Q extends [...infer F] ? {new (...args: F): T} : never

type FlatNameItem<T> = T extends string ? `.${T}` : ''

type FlatObject<T> = T extends Partial<Record<infer F, unknown>> ? {[Q in F]?: Ungroup<T[Q]>} : T

type FlatName<T> = T extends [infer P extends string, ...infer R extends string[]]
  ? `${P}${FlatNameItem<FlatName<R>>}`
  : null
