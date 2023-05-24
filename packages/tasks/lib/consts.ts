export const TaskPriority = {
  INSTANT: 1,
  HIGH: 2,
  NORMAL: 3,
  LOW: 4,
  IDLE: 5
} as const

export const TaskStatus = {
  PENDING: 1,
  WORKING: 2,
  RETRYING: 3,
  DONE: 4,
  ERROR: 5
} as const

// Max 31 bit integer. The max integer size in V8 for 32-bit systems.
// Math.pow(2, 30) - 1
// 0b111111111111111111111111111111
const maxSigned31BitInt = 1073741823

// Times out instantly
export const INSTANT_PRIORITY_TIMEOUT = -1
// Eventually times out
export const HIGH_PRIORITY_TIMEOUT = 250
export const NORMAL_PRIORITY_TIMEOUT = 5000
export const LOW_PRIORITY_TIMEOUT = 10000
// Never times out
export const IDLE_PRIORITY_TIMEOUT = maxSigned31BitInt
