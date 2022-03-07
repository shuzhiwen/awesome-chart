export class DataBase<T, P extends AnyObject = AnyObject> {
  private readonly _storage: Record<string, unknown>

  private readonly _source: T

  private readonly _options: P & {
    order?: AnyObject
  }

  get source() {
    return this._source
  }

  get options() {
    return this._options
  }

  get(key: string) {
    return this._storage[key]
  }

  set(key: string, value: unknown) {
    this._storage[key] = value
  }

  constructor(source: T, options: P) {
    this._options = {...options}
    this._source = source
    this._storage = {}
  }
}
