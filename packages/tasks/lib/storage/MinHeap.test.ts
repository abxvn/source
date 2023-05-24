import { MinHeap } from './MinHeap'

describe('MinHeap', () => {
  it('should reassign top on push', () => {
    const heap = new MinHeap()

    expect(heap.top()).toBeUndefined()

    heap.push({ sortId: 10 })

    expect(heap.top()).toEqual(expect.objectContaining({
      sortId: 10
    }))

    heap.push({ sortId: 6 })

    expect(heap.top()).toEqual(expect.objectContaining({
      sortId: 6
    }))

    heap.push({ sortId: 2 })

    expect(heap.top()).toEqual(expect.objectContaining({
      sortId: 2
    }))
  })

  it('should get top then reassign top if needed', () => {
    const heap = new MinHeap()

    heap.push({ sortId: 10 })
    heap.push({ sortId: 2 })
    heap.push({ sortId: 6 })

    heap.shift()
    expect(heap.top()).toEqual(expect.objectContaining({
      sortId: 6
    }))

    heap.shift()
    expect(heap.top()).toEqual(expect.objectContaining({
      sortId: 10
    }))

    heap.shift()
    expect(heap.top()).toBeUndefined()
  })
})
