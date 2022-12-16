import {sum} from 'd3'
import {EventManager} from '../utils'

export class Scheduler {
  readonly event = new EventManager<'run'>(Scheduler.name)

  private queue: Record<Priority, AnyFunction[]> = {
    topHigh: [],
    topLow: [],
    bottomHigh: [],
    bottomLow: [],
    other: [],
  }

  get taskSize() {
    return sum(Object.values(this.queue).map((queue) => queue.length))
  }

  registerListener(priority: Priority, ...fns: AnyFunction[]) {
    this.queue[priority].push(...fns)
  }

  unregisterListener(priority: Priority, ...fns: AnyFunction[]) {
    fns.map((fn) => this.queue[priority].splice(this.queue[priority].indexOf(fn), 1))
  }

  run() {
    this.queue.topHigh.forEach((fn) => fn())
    this.queue.topLow.forEach((fn) => fn())
    this.queue.other.forEach((fn) => fn())
    this.queue.bottomLow.forEach((fn) => fn())
    this.queue.bottomHigh.forEach((fn) => fn())
    this.event.fire('run')
  }

  clear(priority?: Priority) {
    if (priority) {
      this.queue[priority] = []
    } else {
      this.queue = {
        topHigh: [],
        topLow: [],
        bottomHigh: [],
        bottomLow: [],
        other: [],
      }
    }
  }
}
