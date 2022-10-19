import {merge} from 'lodash'
import {DataBaseOptions} from '../types'

export class DataBase<Source, Options extends DataBaseOptions = DataBaseOptions> {
  private readonly _storage: UnknownObject

  private readonly _source: Source

  private readonly _options: Options

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

  constructor(source: Source, options?: Options) {
    this._options = merge({}, this.options, options)
    this._source = source
    this._storage = {}
  }
}
