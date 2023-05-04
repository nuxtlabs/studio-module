import { field } from '../src/theme'

export default defineNuxtSchema({
  appConfig: {
    someConfig: field({ type: 'string', default: 'schema default' }),
    configFromNuxtSchema: field('boolean', true)
  }
})
