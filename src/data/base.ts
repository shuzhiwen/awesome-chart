import {merge} from 'lodash'
import {DataBaseOptions} from '../types'

export class DataBase<
  Source extends unknown = unknown,
  Options extends DataBaseOptions = DataBaseOptions
> {
  private readonly _source: Source

  private readonly _options: Options

  get source() {
    return this._source
  }

  get options() {
    return this._options
  }

  constructor(source: Source, options?: Options) {
    this._options = merge({}, this.options, options)
    this._source = source
  }
}
