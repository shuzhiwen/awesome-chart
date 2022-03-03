import {createEvent, createLog} from '../utils'
import {DataBase} from './base'

export class Custom extends DataBase<any, AnyObject> {
  readonly log = createLog('data:custom')

  readonly event = createEvent('data:custom')

  private _data: any

  get data() {
    return this._data
  }

  constructor(data: any, options: AnyObject = {}) {
    super({source: data, options})
    this._data = data
  }
}
