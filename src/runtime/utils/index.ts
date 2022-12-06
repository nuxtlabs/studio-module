export * from './files'

export const createSingleton = <T, Params extends Array<any>>(fn: () => T) => {
  let instance: T | undefined
  return (...args: Params) => {
    if (!instance) {
      instance = fn()
    }
    return instance
  }
}
