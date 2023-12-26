/*! Copyright (c) 2023 ABux. Under MIT license found in the LICENSE file */
import { type IHeapPushParams, type IHeap, type IHeapItem } from './interfaces'

export class MinHeap<TData> extends Array<IHeapItem<TData>> implements IHeap<TData> {
  push (...items: Array<IHeapPushParams<TData>>) {
    let originalIdx = this.length

    for (let idx = 0; idx < items.length; idx++) {
      const itemId = originalIdx++
      const item = {
        ...items[idx],
        id: itemId,
      }

      super.push(item)
      this.reassignTopOnPush(item, itemId)
    }

    return items.length
  }

  top () {
    return this[0]
  }

  shift () {
    const first = this.top()
    const last = this.pop()

    if (!first || !last) { // no items found
      return first
    }

    // take last item as base value to compare for picking new top / peek

    if (last !== first) {
      this[0] = last
      this.reassignTopOnShift(last, 0)
    }

    return first
  }

  compare (itemA: IHeapItem<TData>, itemB: IHeapItem<TData>) {
    const diff = itemA.sortId - itemB.sortId

    return diff !== 0 ? diff : itemA.id - itemB.id
  }

  protected reassignTopOnPush (item: IHeapItem<TData>, originalIdx: number) {
    let index = originalIdx

    while (index > 0) {
      const parentIndex = (index - 1) >>> 1 // % 2
      const parent = this[parentIndex]

      if (this.compare(parent, item) > 0) { // parent is larger, swap positions
        this[parentIndex] = item
        this[index] = parent
        index = parentIndex
      } else {
        return // the parent is smaller
      }
    }
  }

  protected reassignTopOnShift (item: IHeapItem<TData>, originalIdx: number) {
    const length = this.length
    const halfLength = length >>> 1
    let index = originalIdx

    while (index < halfLength) {
      const leftIndex = (index + 1) * 2 - 1
      const left = this[leftIndex]
      const rightIndex = leftIndex + 1
      const right = this[rightIndex]

      if (this.compare(left, item) < 0) { // either right or left is smaller, swap with the smaller one of them
        if (rightIndex < length && this.compare(right, left) < 0) {
          this[index] = right
          this[rightIndex] = item
          index = rightIndex
        } else {
          this[index] = left
          this[leftIndex] = item
          index = leftIndex
        }
      } else if (rightIndex < length && this.compare(right, item) < 0) {
        this[index] = right
        this[rightIndex] = item
        index = rightIndex
      } else {
        return // neither child is smaller
      }
    }
  }
}
