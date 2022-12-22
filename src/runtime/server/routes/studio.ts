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
  const runtimeConfig = useRuntimeConfig()

  const { app, content: { sources, ignores, locales, highlight, navigation, documentDriven, experiment } } = runtimeConfig

  // Support for __app_config.json
  const appConfigSchema = runtimeConfig?.appConfigSchema
  let appConfig: any = {}
  if (appConfigSchema) {
    // @ts-ignore
    appConfig = await $fetch.native(joinURL(app.baseURL, '/__app_config.json')).then(r => r.json())
  }

  // Support for __pinceau_tokens_{schema|config}.json
  const hasPinceau = runtimeConfig?.pinceau?.studio
  let tokensConfig: any
  let tokensConfigSchema: any
  if (hasPinceau) {
    // @ts-ignore
    tokensConfig = await $fetch.native(joinURL(app.baseURL, '/__pinceau_tokens_config.json')).then(r => r.json())
    // @ts-ignore
    tokensConfigSchema = await $fetch.native(joinURL(app.baseURL, '/__pinceau_tokens_schema.json')).then(r => r.json())
  }

  return {
    // Studio version
    version,
    // app.config
    appConfigSchema: appConfigSchema || {},
    appConfig,
    // tokens.config
    tokensConfigSchema,
    tokensConfig,
    // @nuxt/content
    content: { sources, ignores, locales, highlight, navigation, documentDriven, experiment },
    // nuxt-component-meta
    components: filteredComponents
  }
})
