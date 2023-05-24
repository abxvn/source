declare module '@abux/tasks/lib/storage/interfaces' {
  export interface IHeapItem<TData> {
    id: number;
    sortId: number;
    data?: TData;
  }
  export type IHeapPushParams<TData> = Omit<IHeapItem<TData>, 'id'>;
  export interface IHeap<TData = any> {
    top: () => IHeapItem<TData> | undefined;
    shift: () => IHeapItem<TData> | undefined;
    push: (...items: Array<IHeapPushParams<TData>>) => number;
    compare: (itemA: IHeapItem<TData>, itemB: IHeapItem<TData>) => number;
  }
}
declare module '@abux/tasks/lib/storage/MinHeap' {
  import { type IHeapPushParams, type IHeap, type IHeapItem } from '@abux/tasks/lib/storage/interfaces';
  export class MinHeap<TData> extends Array<IHeapItem<TData>> implements IHeap<TData> {
    push (...items: Array<IHeapPushParams<TData>>): number;
    top (): IHeapItem<TData>;
    shift (): IHeapItem<TData>;
    compare (itemA: IHeapItem<TData>, itemB: IHeapItem<TData>): number;
  }
}
declare module '@abux/tasks/lib/interfaces' {
  import { type TaskPriority, type TaskStatus } from '@abux/tasks/lib/consts';
  export type ITaskPriority = typeof TaskPriority[keyof typeof TaskPriority];
  export type ITaskStatus = typeof TaskStatus[keyof typeof TaskStatus];
  export interface ITask<TTaskContext extends any | undefined, TPriority extends number = ITaskPriority> {
    status: ITaskStatus;
    execute: ((context: TTaskContext) => Promise<any> | any) | ((context: TTaskContext) => void);
    context: TTaskContext;
    id?: string;
    priority?: TPriority;
  }
  export interface ITaskEmitterOptions<TTask> {
    concurrency: number;
    onItemDone?: (item: TTask) => void;
    onItemError?: (item: TTask, error: Error) => void;
  }
  export interface ITaskEmitter<TTask extends ITask<any, number> = ITask<any, ITaskPriority>> {
    readonly count: number;
    readonly pendingCount: number;
    add: (item: Omit<TTask, 'status'>) => void;
    next: () => void;
  }
}
declare module '@abux/tasks/lib/consts' {
  export const TaskPriority: {
    readonly INSTANT: 1;
    readonly HIGH: 2;
    readonly NORMAL: 3;
    readonly LOW: 4;
    readonly IDLE: 5;
  };
  export const TaskStatus: {
    readonly PENDING: 1;
    readonly WORKING: 2;
    readonly RETRYING: 3;
    readonly DONE: 4;
    readonly ERROR: 5;
  };
  export const INSTANT_PRIORITY_TIMEOUT = -1;
  export const HIGH_PRIORITY_TIMEOUT = 250;
  export const NORMAL_PRIORITY_TIMEOUT = 5000;
  export const LOW_PRIORITY_TIMEOUT = 10000;
  export const IDLE_PRIORITY_TIMEOUT = 1073741823;
}
declare module '@abux/tasks/lib/TaskEmitter' {
  import type { ITaskEmitter, ITask, ITaskPriority, ITaskEmitterOptions } from '@abux/tasks/lib/interfaces';
  import { MinHeap } from '@abux/tasks/lib/storage/MinHeap';
  export class TaskEmitter<TTask extends ITask<any | undefined, number> = ITask<any | undefined, ITaskPriority>> implements ITaskEmitter<TTask> {
    constructor (options?: Partial<ITaskEmitterOptions<TTask>>);
    get pendingCount (): number;
    get count (): number;
    next (): void;
    add (item: Omit<TTask, 'status'>): void;
  }
}
declare module '@abux/tasks/index' {
  export { TaskEmitter } from '@abux/tasks/lib/TaskEmitter';
  export * from '@abux/tasks/lib/consts';
  export type { ITask, ITaskPriority, ITaskEmitter, ITaskStatus } from '@abux/tasks/lib/interfaces';
}
declare module '@abux/tasks' {
  export * from '@abux/tasks/index'
}
