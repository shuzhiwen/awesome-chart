import {createLog} from '../utils'

export class DataBase<T, P extends AnyObject = AnyObject> {
  readonly log = createLog(this.constructor.name)

  private readonly _storage: UnknownObject

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

  constructor(source: T, options: P = {} as any) {
    this._options = {...options}
    this._source = source
    this._storage = {}
  }
}
