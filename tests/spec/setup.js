if (typeof global.setImmediate === 'undefined') {
  Object.assign(global, {
    setImmediate: setTimeout,
    clearImmediate: clearTimeout,
  })
}
