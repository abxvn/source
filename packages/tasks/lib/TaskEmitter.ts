import {
  HIGH_PRIORITY_TIMEOUT,
  IDLE_PRIORITY_TIMEOUT,
  INSTANT_PRIORITY_TIMEOUT,
  LOW_PRIORITY_TIMEOUT,
  NORMAL_PRIORITY_TIMEOUT,
  TaskPriority,
  TaskStatus,
} from './consts'
import type { ITaskEmitter, ITask, ITaskPriority, ITaskStatus, ITaskEmitterOptions } from './interfaces'
import { MinHeap } from './storage/MinHeap'

export class TaskEmitter<
  TTask extends ITask<any | undefined, number> = ITask<any | undefined, ITaskPriority>
> implements ITaskEmitter<TTask> {
  protected readonly options: ITaskEmitterOptions<TTask>
  protected readonly items = new MinHeap<TTask>()
  protected runningCount = 0

  constructor (options?: Partial<ITaskEmitterOptions<TTask>>) {
    this.options = {
      concurrency: 1,
      ...options,
    }
  }

  get pendingCount () {
    return this.items.length
  }

  get count () {
    return this.pendingCount + this.runningCount
  }

  next () {
    if (this.options.concurrency <= this.runningCount) {
      return
    }

    let nextItem

    while (!nextItem) { // seeking next task
      nextItem = this.items.shift()

      if (!nextItem) {
        return // no next tasks found
      }

      // ensure task data is provided
      if (!nextItem.data) {
        continue // empty task data, seek more
      }
    }

    void this.execute(nextItem.data as TTask)
    this.next()
  }

  add (item: Omit<TTask, 'status'>) {
    const priority: TTask['priority'] = item.priority || TaskPriority.NORMAL
    const status: ITaskStatus = TaskStatus.PENDING

    const data = {
      status,
      priority,
      ...item,
    }

    const task = data as TTask

    this.items.push({
      sortId: this.getItemSortId(task),
      data: task,
    })
  }

  protected async execute (item: TTask) {
    const onItemDone = this.options.onItemDone
    const onItemError = this.options.onItemError

    try {
      item.status = TaskStatus.WORKING
      this.runningCount++

      const output = item.execute(item.context)

      if (output instanceof Promise) {
        // in case `execute` is async function
        await output
      }

      item.status = TaskStatus.DONE
      if (onItemDone) {
        onItemDone(item)
      }
    } catch (err: any) {
      item.status = TaskStatus.ERROR
      if (onItemError) {
        onItemError(item, err)
      }
    } finally {
      this.runningCount--
      this.next()
    }
  }

  protected getItemSortId (item: TTask) {
    const priority = item.priority
    let timeout

    switch (priority) {
      case TaskPriority.INSTANT:
        timeout = INSTANT_PRIORITY_TIMEOUT
        break
      case TaskPriority.HIGH:
        timeout = HIGH_PRIORITY_TIMEOUT
        break
      case TaskPriority.LOW:
        timeout = LOW_PRIORITY_TIMEOUT
        break
      case TaskPriority.IDLE:
        timeout = IDLE_PRIORITY_TIMEOUT
        break
      default:
        timeout = NORMAL_PRIORITY_TIMEOUT
        break
    }

    return getTime() + timeout
  }
}

let getTime: () => number

if (
  typeof window !== 'undefined' &&
  typeof window.performance !== 'undefined' &&
  typeof window.performance.now === 'function') {
  getTime = () => window.performance.now()
} else {
  getTime = () => Date.now()
}
