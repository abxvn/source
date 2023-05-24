export interface IHeapItem<TData> {
  id: number
  sortId: number
  data?: TData
}

export type IHeapPushParams<TData> = Omit<IHeapItem<TData>, 'id'>
export interface IHeap<TData = any> {
  top: () => IHeapItem<TData> | undefined // find-max, aka peek
  shift: () => IHeapItem<TData> | undefined // find-max-then-remove, aka pop
  push: (...items: Array<IHeapPushParams<TData>>) => number
  compare: (itemA: IHeapItem<TData>, itemB: IHeapItem<TData>) => number
}
