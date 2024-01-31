@abxvn/tasks
=====
[![build][badge-build]][changelog]
[![version][npm-version-badge]][npm-url]
[![downloads][npm-downloads-badge]][npm-url]

A priority based task runner which is:
- Type safed
- Extremely fast
- Light-weight
- No dependencies

**Table of contents**
* [Installation](#installation)
* [Usage](#usage)
  + [Add and run tasks](#add-and-run-tasks)
  + [Default task priorities](#default-task-priorities)
  + [Provide task context](#provide-task-context)
  + [Custom task type](#custom-task-type)
* [Changelog](#changelog)
* [Contribution](#contribution)

Installation
-----
Pick **one of** these commands to install:
```
pnpm add @abxvn/tasks
yarn add @abxvn/tasks
npm install --save @abxvn/tasks
```

Usage
-----

### Add and run tasks

Tasks can be provided with optional `id` and `context`, can be add to the task registry like this:

```typescript
import { TaskEmitter, TaskPriority } from '@abxvn/tasks'

const tasks = new TaskEmitter()

// `execute` is example function
// if not priority provided, default to TaskPriority.NORMAL
const normalPriorityTask = { execute } 
const lowPriorityTask = { execute, priority: TaskPriority.LOW }
const hightPriorityTask = { execute, priority: TaskPriority.HIGH }

tasks.add(normalPriorityTask)
tasks.add(lowPriorityTask)
tasks.add(hightPriorityTask)

// Execute tasks
// Execution order will be hightPriorityTask > normalPriorityTask > lowPriorityTask
tasks.next()
```

### Default task priorities

```
// From highest to lowest
export const TaskPriority = {
  INSTANT: 1,
  HIGH: 2,
  NORMAL: 3,
  LOW: 4,
  IDLE: 5
} as const
```

### Provide task context

If a task context is provided, when the time comes, it will be `execute` with the context

```typescript
// `execute` is example function
const execute = ({ name }) => console.log(name)
const taskWithContext = { execute, context: { name: 'Hello' } }

tasks.add(taskWithContext)
tasks.next() // console.log 'Hello'
```

### Custom task type

You can customize task type, or its context and priority types too:

```typescript
import { ITask, EventEmitter } from '@abxvn/tasks`

type ICustomContextType = {...} | undefined
type ICustomPriorityType = {...}

type ICustomTaskType1 = ITask<ICustomContextType>
type ICustomTaskType2 = ITask<ICustomContextType, ICustomPriorityType>
interface ICustomTaskType3 extends ITask { ... }

const tasks1 = new EventEmitter<ICustomTaskType1>()
const tasks2 = new EventEmitter<ICustomTaskType2>()
const tasks2 = new EventEmitter<ICustomTaskType3>()
```

### Introduce sub task after task

New sub tasks can be added into queue inside a task execution

```typescript
// `execute` is example function
const subtaskExecute = () => console.log('subtask')
const taskExecute = (_, tasks) => {
  console.log('task')
  tasks.add({ execute: subtaskExecute })
}

tasks.add({ execute: taskExecute })
tasks.next()
// console.log 'task'
// console.log 'subtask'
```

Changelog
-----
See [CHANGELOG.md][changelog]

Contribution
-----

All PRs and ideas for improvement are welcomed. 

If you got any issues using this package, don't hesitate to create new [🐞 Bug report][issues] with a proper `package:<name>` label.

Feel free to clone this project, make changes that your feel necessary and pull request anytime you want.

Install dependencies and run development build:
```
yarn install
yarn start
```

**Working on your first Pull Request?**

You can learn how from this free video series: [How to Contribute to an Open Source Project on GitHub](https://egghead.io/courses/how-to-contribute-to-an-open-source-project-on-github)

To help you get your feet wet and get you familiar with our contribution process, we have a list of good first issues that contain bugs that have a relatively limited scope. This is a great place to get started.

-----
Cheers 🍻

[changelog]: https://github.com/abxvn/source/blob/main/packages/tasks/CHANGELOG.md
[issues]: https://github.com/abxvn/source/issues?q=is%3Aopen+is%3Aissue+label%3Apackage%3Atasks
[good-first]: https://github.com/abxvn/source/issues?q=is%3Aopen+is%3Aissue+label%3Aflag%3Agood-first
[badge-build]: https://github.com/abxvn/source/actions/workflows/build.yaml/badge.svg
[npm-url]: https://www.npmjs.com/package/@abxvn/tasks
[npm-downloads-badge]: https://img.shields.io/npm/dw/@abxvn/tasks
[npm-version-badge]: https://img.shields.io/npm/v/@abxvn/tasks

