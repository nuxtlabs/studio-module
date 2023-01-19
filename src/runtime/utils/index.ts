export * from './files'

export const StudioConfigRoot = '.studio'
export const StudioConfigFiles = {
  appConfig: `${StudioConfigRoot}/app.config.json`,
  tokensConfig: `${StudioConfigRoot}/tokens.config.json`
}

export const createSingleton = <T, Params extends Array<any>>(fn: () => T) => {
  let instance: T | undefined
  return (...args: Params) => {
    if (!instance) {
      instance = fn()
    }
    return instance
  }
}
