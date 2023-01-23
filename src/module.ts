import { existsSync } from 'node:fs'
import { defu } from 'defu'
import { addPrerenderRoutes, installModule, defineNuxtModule, addPlugin, extendViteConfig, createResolver, logger, addComponentsDir, addServerHandler, resolveAlias, extendPages } from '@nuxt/kit'

const log = logger.withScope('@nuxt/studio')

export interface ModuleOptions {
  /**
   * Enable Studio mode
   * @default: 'production'
   **/
  enabled: 'production' | true
}

declare module '@nuxt/schema' {
  interface NuxtConfig {
    ['studio']?: ModuleOptions
  }
  interface NuxtOptions {
    ['studio']: ModuleOptions
  }
}

export interface ModuleHooks {}

export default defineNuxtModule({
  meta: {
    configKey: 'studio'
  },
  defaults: {
    enabled: 'production'
  },
  async setup (options, nuxt) {
    // @ts-ignore
    nuxt.hook('schema:resolved', (schema: any) => {
      nuxt.options.runtimeConfig.appConfigSchema = {
        properties: schema.properties?.appConfig,
        default: schema.default?.appConfig
      }
    })
    // Support custom ~/.studio/app.config.json
    nuxt.hook('app:resolve', (appCtx) => {
      const studioAppConfigPath = resolveAlias('~/.studio/app.config.json')
      if (existsSync(studioAppConfigPath)) {
        appCtx.configs.unshift(studioAppConfigPath)
      }
    })
    await installModule('nuxt-config-schema')

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
    nuxt.options.runtimeConfig.studio = nuxt.options.runtimeConfig.studio || {}
    nuxt.options.runtimeConfig.public.studio = defu(nuxt.options.runtimeConfig.public.studio, { apiURL })

    extendViteConfig((config) => {
      config.optimizeDeps = config.optimizeDeps || {}
      config.optimizeDeps.include = config.optimizeDeps.include || []
      config.optimizeDeps.include.push(
        'socket.io-client', 'slugify'
      )
    })

    // Add plugins
    addPlugin(resolve('./runtime/plugins/preview-detector'))
    addPlugin(resolve('./runtime/plugins/iframe.client'))

    // TODO: Remove workaround ASAP when Nitro supports app.config
    addPlugin(resolve('./runtime/plugins/app-config.server'))

    // Register components
    addComponentsDir({
      path: resolve('./runtime/components')
    })

    // Ensure `/__app_config.json` is a valid route in the app
    extendPages((pages) => {
      pages.push({
        name: '__app_config.json',
        path: '/__app_config.json',
        file: resolve('./runtime/pages/empty'),
        children: []
      })
    })

    // Add server route to know Studio is enabled
    addServerHandler({
      method: 'get',
      route: '/__studio.json',
      handler: resolve('./runtime/server/routes/studio')
    })
    addPrerenderRoutes('/__studio.json')

    // Install dependencies
    await installModule('nuxt-component-meta')
  }
})
