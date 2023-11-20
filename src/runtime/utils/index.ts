export * from './files'

export const StudioConfigFiles = {
  appConfig: 'app.config.ts',
  nuxtConfig: 'nuxt.config.ts',
  tokensConfig: 'tokens.config.ts'
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

// https://github.com/nuxt/framework/blob/02df51dd577000082694423ea49e1c90737585af/packages/nuxt/src/app/config.ts#L12
export function deepDelete (obj: any, newObj: any) {
  for (const key in obj) {
    const val = newObj[key]
    if (!(key in newObj)) {
      delete (obj as any)[key]
    }

    if (val !== null && typeof val === 'object') {
      deepDelete(obj[key], newObj[key])
    }
  }
}

// https://github.com/nuxt/framework/blob/02df51dd577000082694423ea49e1c90737585af/packages/nuxt/src/app/config.ts#L25
export function deepAssign (obj: any, newObj: any) {
  for (const key in newObj) {
    const val = newObj[key]
    if (val !== null && typeof val === 'object') {
      // Replace array types
      if (Array.isArray(val) && Array.isArray(obj[key])) {
        obj[key] = val
      } else {
        obj[key] = obj[key] || {}
        deepAssign(obj[key], val)
      }
    } else {
      obj[key] = val
    }
  }
}
