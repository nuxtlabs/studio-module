import { existsSync } from 'node:fs'
import { defu } from 'defu'
import { addPrerenderRoutes, installModule, defineNuxtModule, addPlugin, extendViteConfig, createResolver, logger, addComponentsDir, addServerHandler, resolveAlias } from '@nuxt/kit'

const log = logger.withTag('@nuxt/studio')

export interface ModuleOptions {
  /**
   * Enable Studio mode
   * @default: 'production'
   **/
  enabled: 'production' | true
  /**
   * Studio project(s) to link
   *
   * If you have multiple projects, you can use an array of strings.
   *
   * @example 'team-slug/project-slug'
   * or
   * @example ['team-slug/project-slug', 'team-slug/project-slug-2']
   * @default: ''
   **/
  project: string | string[]
}

export interface ModuleHooks {}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'studio',
    configKey: 'studio'
  },
  defaults: {
    enabled: 'production',
    project: ''
  },
  async setup (options, nuxt) {
    // @ts-ignore
    nuxt.hook('schema:resolved', (schema: any) => {
      nuxt.options.runtimeConfig.appConfigSchema = {
        properties: schema.properties?.appConfig,
        default: schema.default?.appConfig
      }
      nuxt.options.runtimeConfig.contentSchema = schema.properties?.content || {}
    })

    // Support custom ~/.studio/app.config.json
    nuxt.hook('app:resolve', (appCtx) => {
      const studioAppConfigPath = resolveAlias('~/.studio/app.config.json')
      if (existsSync(studioAppConfigPath)) {
        appCtx.configs.unshift(studioAppConfigPath)
      }
    })

    // Only enable Studio in production build
    if (options.enabled === 'production' && nuxt.options.dev === true) {
      return
    }

    const contentModule = '@nuxt/content'
    // Check Content module is installed
    if (
      !nuxt.options.runtimeConfig.content &&
      !nuxt.options.modules.includes(contentModule)
    ) {
      log.warn('Could not find `@nuxt/content` module. Please install it to enable preview mode.')
      return
    }
    // Check Content module version
    const contentModuleVersion = await import(contentModule)
      .then(m => m.default || m)
      .then((m: any) => m.getMeta())
      .then(m => m.version)
      .catch(() => '0')
    if (contentModuleVersion < '2.1.1') {
      log.warn('Please update `@nuxt/content` to version 2.1.1 or higher to enable preview mode.')
      return
    }

    // Check Pinceau module activated
    // @ts-ignore
    nuxt.hook('pinceau:options', (options) => {
      options.studio = true
    })

    const { resolve } = createResolver(import.meta.url)

    const apiURL = process.env.NUXT_PUBLIC_STUDIO_API_URL || process.env.STUDIO_API || 'https://api.nuxt.studio'
    const publicToken = process.env.NUXT_PUBLIC_STUDIO_TOKENS
    nuxt.options.runtimeConfig.studio = defu(nuxt.options.runtimeConfig.studio, {
      publicToken,
      project: options.project
    })
    nuxt.options.runtimeConfig.public.studio = defu(nuxt.options.runtimeConfig.public.studio, { apiURL })

    extendViteConfig((config) => {
      config.optimizeDeps = config.optimizeDeps || {}
      config.optimizeDeps.include = config.optimizeDeps.include || []
      config.optimizeDeps.include.push(
        'socket.io-client', 'slugify'
      )
    })

    // Add plugins
    addPlugin(resolve('./runtime/plugins/preview.client'))

    // Register components
    addComponentsDir({ path: resolve('./runtime/components') })

    // Add server route to know Studio is enabled
    addServerHandler({
      method: 'get',
      route: '/__studio.json',
      handler: resolve('./runtime/server/routes/studio')
    })
    addPrerenderRoutes('/__studio.json')

    // Install dependencies
    await installModule('nuxt-component-meta', {
      globalsOnly: true
    })
  }
})
