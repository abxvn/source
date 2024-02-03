import {
  type TaskPriority,
  type TaskStatus,
} from './consts'

export type ITaskPriority = typeof TaskPriority[keyof typeof TaskPriority]
export type ITaskStatus = typeof TaskStatus[keyof typeof TaskStatus]

export interface ITaskExecute<TContext = any, TPriority extends number = ITaskPriority> {
  (context: TContext, tasks: ITaskEmitter<ITask<TContext, TPriority>>): Promise<any>
  (context: TContext, tasks: ITaskEmitter<ITask<TContext, TPriority>>): any
  (context: TContext): Promise<any>
  (context: TContext): any
  (): Promise<any>
  (): any
}

export interface ITask<
  TContext = any,
  TPriority extends number = ITaskPriority
> {
  status: ITaskStatus
  execute: ITaskExecute<TContext, TPriority>
  context?: TContext
  id?: string
  priority?: TPriority
}

export interface ITaskEmitterOptions<TTask> {
  concurrency: number
  onItemDone?: (item: TTask) => void
  onItemError?: (item: TTask, error: Error) => void
}

export interface ITaskEmitterControls {
  /**
   * Start queue or resume queue if stopped
   */
  start: () => void

  /**
   * Stop queue, preventing next task from executing
   */
  stop: () => void

  /**
   * Clean up queue, stopping queue and clearing all tasks
   */
  dispose: () => void
}

export interface ITaskEmitter<TTask extends ITask<any, number> = ITask> extends ITaskEmitterControls {
  /**
   * Total count of tasks added
   */
  readonly count: number

  /**
   * Total count of tasks running
   */
  readonly pendingCount: number

  /**
   * Total count of tasks pending
   */
  readonly runningCount: number

  /**
   * Queue new task
   * @param item task data
   */
  add: (item: Omit<TTask, 'status'>) => void

  /**
   * Start queue or attempt to execute next task
   * If the queue is stopped, this method does nothing, calling `start` to resume queue
   */
  next: () => void
}
