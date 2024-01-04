import { field, group } from '@nuxthq/studio/theme'

export default defineNuxtSchema({
  appConfig: {
    header: group({
      title: 'Header',
      fields: {
        title: field({ type: 'string' })
      }
    })
  }
})
