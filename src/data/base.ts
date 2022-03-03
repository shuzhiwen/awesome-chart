import {Event, Log} from '../types'

export abstract class DataBase<T, P extends AnyObject> {
  abstract readonly log: Log

  abstract readonly event: Event

  private readonly storage: AnyObject = {}

  readonly source: T

  readonly _options: P & {
    // order affects color fetching
    order?: AnyObject
  }

  get options() {
    return this._options
  }

  constructor({source, options}: {source: T; options: P}) {
    this._options = options
    this.source = source
  }

  set(key: string, value: any) {
    this.storage[key] = value
  }

  get(key: string) {
    return this.storage[key]
  }
}
