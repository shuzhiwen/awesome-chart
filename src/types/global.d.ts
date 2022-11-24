type Meta = number | string

type Maybe<T> = T | null | undefined

type MaybeGroup<T> = Maybe<T | T[]>

type AnyObject = Record<string, any>

type Padding<T = number> = [T, T, T, T]

type AnyFunction<T = unknown> = (...args: any) => T

type AnyEventObject = Record<string, AnyFunction>

type Ungroup<T> = T extends Array<infer V> ? Ungroup<V> : T

type ArrayItem<T> = T extends Array<infer V> ? V : T

type Newable<T, P> = new (...args: P extends [...infer V] ? V : [P]) => T

type Computable<T, P = never> = T | ((props: P) => T)

type Keys<T> = T extends Set<infer K>
  ? K
  : T extends Map<infer K, unknown>
  ? K
  : T extends Record<infer K, unknown>
  ? K
  : keyof T
