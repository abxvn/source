import {
  type TaskPriority,
  type TaskStatus,
} from './consts'

export type ITaskPriority = typeof TaskPriority[keyof typeof TaskPriority]
export type ITaskStatus = typeof TaskStatus[keyof typeof TaskStatus]

export interface ITask<
  TTaskContext extends any | undefined,
  TPriority extends number = ITaskPriority
> {
  status: ITaskStatus
  execute: ((context: TTaskContext) => Promise<any> | any) | ((context: TTaskContext) => void)
  context: TTaskContext
  id?: string
  priority?: TPriority
}

export interface ITaskEmitterOptions<TTask> {
  concurrency: number
  onItemDone?: (item: TTask) => void
  onItemError?: (item: TTask, error: Error) => void
}

export interface ITaskEmitter<TTask extends ITask<any, number> = ITask<any, ITaskPriority>> {
  readonly count: number
  readonly pendingCount: number

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
