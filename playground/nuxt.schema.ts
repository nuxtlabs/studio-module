import { field } from '../src/theme'

export default defineNuxtConfigSchema({
  appConfig: {
    someConfig: field({ type: 'string', default: 'schema default' }),
    configFromNuxtSchema: field('boolean', true)
  }
})
