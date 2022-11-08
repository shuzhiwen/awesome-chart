type Meta = number | string

type Maybe<T> = T | null | undefined

type MaybeGroup<T> = Maybe<T | T[]>

type AnyObject = Record<string, any>

type UnknownObject = Record<string, unknown>

type Padding = [number, number, number, number]

type AnyFunction<T = unknown> = (...args: any) => T

type AnyEventObject = Record<string, AnyFunction>

type Ungroup<T> = T extends Array<infer V> ? Ungroup<V> : T

type ArrayItem<T> = T extends Array<infer V> ? V : T

type Newable<T, P> = P extends [...infer V] ? {new (...args: V): T} : never

type Computable<T, P = never> = T | ((props: P) => T)

type Keys<T> = T extends Set<infer K>
  ? K
  : T extends Map<infer K, unknown>
  ? K
  : T extends Record<infer K, unknown>
  ? K
  : never
