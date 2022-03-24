import {Log} from '../types'
import {createLog} from '../utils'

export class DataBase<T extends AnyObject, P extends AnyObject = AnyObject> {
  readonly log: Log

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
    this.log = createLog(this.constructor.name)
    this._options = {...options}
    this._source = source || {}
    this._storage = {}
  }
}
