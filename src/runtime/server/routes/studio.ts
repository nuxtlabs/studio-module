import type { ComponentMeta } from 'vue-component-meta'
import { eventHandler } from 'h3'
import { joinURL } from 'ufo'
import { useRuntimeConfig, useAppConfig } from '#imports'
// @ts-expect-error import does exist
import components from '#nuxt-component-meta/nitro'

interface NuxtComponentMeta {
  pascalName: string
  filePath: string
  meta: ComponentMeta
  global: boolean
}

export default eventHandler(async () => {
  const componentsIgnoredPrefix = ['Content', 'DocumentDriven', 'Markdown']
  const filteredComponents = (Object.values(components) as NuxtComponentMeta[])
    .filter(c => c.global && !componentsIgnoredPrefix.some(prefix => c.pascalName.startsWith(prefix)))
    .map(({ pascalName, filePath, meta }) => {
      return {
        name: pascalName,
        path: filePath,
        meta: {
          props: meta.props,
          slots: meta.slots,
          events: meta.events,
        },
      }
    })

  const appConfig = useAppConfig()
  const runtimeConfig = useRuntimeConfig()
  const { app, contentSchema, appConfigSchema, studio, content: { sources, ignores, locales, defaultLocale, highlight, navigation, documentDriven, experimental } } = runtimeConfig

  // Delete GitHub tokens for multiple source to avoid exposing them
  const safeSources: Record<string, unknown> = {}
  Object.keys(sources).forEach((name) => {
    const { driver, prefix, base, repo, branch, dir } = sources[name] || {}
    safeSources[name] = {
      driver,
      prefix,
      base,
      repo,
      branch,
      dir,
    }
  })
  const hasPinceau = runtimeConfig?.pinceau?.studio
  let tokensConfig
  let tokensConfigSchema
  if (hasPinceau) {
    // @ts-expect-error Support for __pinceau_tokens_{schema|config}.json
    tokensConfig = await $fetch.native(joinURL(app.baseURL, '/__pinceau_tokens_config.json')).then(r => r.json())
    // @ts-expect-error Support for __pinceau_tokens_{schema|config}.json
    tokensConfigSchema = await $fetch.native(joinURL(app.baseURL, '/__pinceau_tokens_schema.json')).then(r => r.json())
  }

  return {
    // Studio version
    version: studio.version,
    tokens: studio?.publicToken,
    gitInfo: studio?.gitInfo || {},
    // nuxt.schema for Nuxt Content frontmatter
    contentSchema: contentSchema || {},
    // app.config
    appConfigSchema: appConfigSchema || {},
    appConfig,
    // tokens.config
    tokensConfigSchema,
    tokensConfig,
    // @nuxt/content
    content: { sources: safeSources, ignores, locales, defaultLocale, highlight, navigation, documentDriven, experimental },
    // nuxt-component-meta
    components: filteredComponents,
  }
})
