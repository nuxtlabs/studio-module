export * from './files'

export const StudioConfigFiles = {
  appConfig: 'app.config.ts',
  nuxtConfig: 'nuxt.config.ts',
}

export const createSingleton = <T, Params extends Array<unknown>>(fn: () => T) => {
  let instance: T | undefined
  return (_args?: Params) => {
    if (!instance) {
      instance = fn()
    }
    return instance
  }
}

// https://github.com/nuxt/framework/blob/02df51dd577000082694423ea49e1c90737585af/packages/nuxt/src/app/config.ts#L12
export function deepDelete(obj: Record<string, unknown>, newObj: Record<string, unknown>) {
  for (const key in obj) {
    const val = newObj[key]
    if (!(key in newObj)) {
      // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
      delete obj[key]
    }

    if (val !== null && typeof val === 'object') {
      deepDelete(obj[key] as Record<string, unknown>, newObj[key] as Record<string, unknown>)
    }
  }
}

// https://github.com/nuxt/framework/blob/02df51dd577000082694423ea49e1c90737585af/packages/nuxt/src/app/config.ts#L25
export function deepAssign(obj: Record<string, unknown>, newObj: Record<string, unknown>) {
  for (const key in newObj) {
    const val = newObj[key]
    if (val !== null && typeof val === 'object') {
      // Replace array types
      if (Array.isArray(val) && Array.isArray(obj[key])) {
        obj[key] = val
      }
      else {
        obj[key] = obj[key] || {}
        deepAssign(obj[key] as Record<string, unknown>, val as Record<string, unknown>)
      }
    }
    else {
      obj[key] = val
    }
  }
}
