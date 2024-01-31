import { TaskEmitter } from './TaskEmitter'
import { TaskPriority } from './consts'

describe('TaskEmitter', () => {
  it('picks tasks to process based on their priorities', () => {
    const tasks = new TaskEmitter()
    const mockExecute = jest.fn()

    tasks.add({
      execute: mockExecute,
      priority: TaskPriority.LOW,
      context: { name: 'low-priority' }
    })

    tasks.add({
      execute: mockExecute,
      priority: TaskPriority.HIGH,
      context: { name: 'high-priority' }
    })

    tasks.add({ // priority omit so it will be normal
      execute: mockExecute,
      context: { name: 'normal-priority' }
    })

    tasks.next()
    expect(mockExecute).toHaveBeenCalledTimes(3)
    expect(mockExecute).toHaveBeenNthCalledWith(1, expect.objectContaining({ name: 'high-priority' }), tasks)
    expect(mockExecute).toHaveBeenNthCalledWith(2, expect.objectContaining({ name: 'normal-priority' }), tasks)
    expect(mockExecute).toHaveBeenNthCalledWith(3, expect.objectContaining({ name: 'low-priority' }), tasks)
  })

  it('reports if tasks done or get errors', () => {
    const onItemDone = jest.fn()
    const onItemError = jest.fn()
    const tasks = new TaskEmitter({ onItemDone, onItemError })
    const mockExecute = jest.fn()
    const mockExecuteError = jest.fn().mockImplementation(() => {
      throw Error('test error')
    })

    tasks.add({ id: 1, execute: mockExecute })
    tasks.add({ id: 2, execute: mockExecuteError })
    tasks.next()

    expect(onItemDone).toHaveBeenCalledTimes(1)
    expect(onItemDone).toHaveBeenCalledWith(expect.objectContaining({ id: 1 }))
    expect(onItemError).toHaveBeenCalledTimes(1)
    expect(onItemError).toHaveBeenCalledWith(
      expect.objectContaining({ id: 2 }),
      expect.objectContaining({ message: 'test error' })
    )
  })

  it('allows concurrency for processing tasks', async () => {
    const onItemDone = jest.fn()
    const tasks = new TaskEmitter({ onItemDone, concurrency: 2 })
    const mockExecute = jest.fn()
    const mockExecuteAsync = jest.fn().mockImplementation(async () => await new Promise((resolve) => {
      setTimeout(resolve, 1000)
    }))

    tasks.add({ id: 1, execute: mockExecuteAsync, priority: TaskPriority.HIGH })
    tasks.add({ id: 2, execute: mockExecute })
    tasks.next()

    await mockExecuteAsync() // delay for 1s

    expect(onItemDone).toHaveBeenCalledTimes(2)
    // even if task id=2 has lower priority but with concurrency
    // and task id=1 need 1s to complete its async execution
    // so task id=2 will be done first
    expect(onItemDone).toHaveBeenNthCalledWith(1, expect.objectContaining({ id: 2 }))
    expect(onItemDone).toHaveBeenNthCalledWith(2, expect.objectContaining({ id: 1 }))
  })
})
