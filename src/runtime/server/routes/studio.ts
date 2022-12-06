import type { ComponentMeta } from 'vue-component-meta'
import { eventHandler } from 'h3'
import { joinURL } from 'ufo'
import { version } from '../../../../package.json'
import { useRuntimeConfig } from '#imports'
// @ts-ignore
import components from '#nuxt-component-meta/nitro'

interface NuxtComponentMeta {
  pascalName: string
  filePath: string
  meta: ComponentMeta
  global: boolean
}

export default eventHandler(async (event) => {
  const filteredComponents = (Object.values(components) as NuxtComponentMeta[])
    .filter(c => c.global)
    .filter(c => !c.pascalName.startsWith('Content'))
    .filter(c => !c.pascalName.startsWith('DocumentDriven'))
    .filter(c => !c.pascalName.startsWith('Markdown'))
    .filter(c => !c.pascalName.startsWith('Prose'))
    .map(({ pascalName, filePath, meta }) => {
      return {
        name: pascalName,
        path: filePath,
        meta: {
          props: meta.props,
          slots: meta.slots,
          events: meta.events
        }
      }
    })

  // TODO: Remove workaround ASAP when Nitro supports app.config
  // @ts-ignore
  const { app, appConfigSchema, content: { sources, ignores, locales, highlight, navigation, documentDriven, experiment } } = useRuntimeConfig()
  const appConfig = await $fetch.native(joinURL(app.baseURL, '/__app_config.json')).then(r => r.json())
  return {
    version,
    appConfigSchema: appConfigSchema || {},
    appConfig,
    content: { sources, ignores, locales, highlight, navigation, documentDriven, experiment },
    components: filteredComponents
  }
})
