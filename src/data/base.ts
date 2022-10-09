import {merge} from 'lodash'
import {DataBaseOptions} from '../types'

export class DataBase<T, P extends DataBaseOptions = DataBaseOptions> {
  private readonly _storage: UnknownObject

  private readonly _source: T

  private readonly _options: P

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

  constructor(source: T, options?: P) {
    this._options = merge({}, this.options, options)
    this._source = source
    this._storage = {}
  }
}
