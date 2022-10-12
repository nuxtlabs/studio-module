import { defu } from 'defu'
import { defineNuxtModule, addPlugin, extendViteConfig, createResolver, logger, addComponentsDir } from '@nuxt/kit'

const log = logger.withScope('@nuxt/studio')

export interface ModuleOptions {}

export interface ModuleHooks {}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    configKey: 'studio'
  },
  defaults: {},
  async setup (_options, nuxt) {
    // Check Content module is installed
    if (
      !nuxt.options.runtimeConfig.content &&
      !nuxt.options.modules.includes('@nuxt/content')
    ) {
      log.warn('Could not find `@nuxt/content` module. Please install it to use preview mode.')
      return
    }
    // Check Content module version
    const contentModuleVersion = await import('@nuxt/content').then((m: any) => m.getMeta()).then(m => m.version).catch(() => '0')
    if (contentModuleVersion < '2.1.1') {
      log.warn('Please update `@nuxt/content` to version 2.1.2 or higher to use preview mode.')
      return
    }

    const { resolve } = createResolver(import.meta.url)

    const apiURL = process.env.NUXT_PUBLIC_STUDIO_API_URL || 'https://api.nuxt.studio'
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

    // Register components
    addComponentsDir({
      path: resolve('./runtime/components')
    })
  }
})
