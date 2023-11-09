import { field, group } from '../src/theme'

export default defineNuxtSchema({
  appConfig: {
    parent: group({
      title: 'Parent',
      description: 'Parent description',
      fields: {
        someConfig: field({ type: 'string', default: 'schema default' }),
        configFromNuxtSchema: field({ type: 'boolean' })
      }
    })
  }
})
