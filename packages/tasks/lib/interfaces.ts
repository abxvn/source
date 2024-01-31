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

export interface ITaskEmitter<TTask extends ITask<any, number> = ITask> {
  readonly count: number
  readonly pendingCount: number
  readonly runningCount: number

  add: (item: Omit<TTask, 'status'>) => void
  next: () => void
}

// export interface IRetriableTask<
//   TaskContext extends ITaskContext = ITaskContext,
//   PriorityType extends number = ITaskPriority
// > extends ITask<TaskContext, PriorityType> {
//   error?: Error
//   retries?: number
// }
// export type ITaskParams = Omit<ITask, 'status' | 'error'>
// export interface ITaskEmitterOptions {
//   maxRetries: number
//   maxConcurrency: number
// }
