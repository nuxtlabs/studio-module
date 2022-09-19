import { stat } from 'fs/promises'
import { withoutTrailingSlash } from 'ufo'
import { defu } from 'defu'
import { defineNuxtModule, installModule, addServerHandler, addPlugin, extendViteConfig, addComponentsDir, createResolver, logger } from '@nuxt/kit'
import meta from 'nuxt-component-meta'

const log = logger.withScope('@nuxt/studio')

export interface ModuleOptions {}

export interface ModuleHooks {}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    configKey: 'studio'
  },
  defaults: {},
  async setup (_options, nuxt) {
    const { resolve } = createResolver(import.meta.url)

    nuxt.options.runtimeConfig.public.studio = defu(nuxt.options.runtimeConfig.public.studio, {
      apiURL: process.env.NUXT_PUBLIC_STUDIO_API_URL || 'https://api.nuxt.com'
    })

    nuxt.hook('nitro:config', (nitroConfig) => {
      nitroConfig.storage = nitroConfig.storage || {}
      nitroConfig.storage['content:source:preview'] = {
        driver: resolve('./runtime/server/preview-driver.mjs') as any,
        baseURL: nuxt.options.runtimeConfig.public.studio.apiURL
      }
      // Inline module runtime in Nitro bundle
      nitroConfig.externals = defu(nitroConfig.externals, {
        inline: [resolve('./runtime')]
      })
      nitroConfig.alias['#studio/server/utils'] = resolve('./runtime/server/utils')
    })

    // In local developement, the playground and studio are in different domains
    // Forward this to make iframe window accessible
    if (process.env.NUXT_STUDIO_DEV_PROXY) {
      nuxt.hook('vite:extendConfig', (config) => {
        config.server = config.server || {}
        config.server.proxy = config.server.proxy || {}
        config.server.proxy['/_studio'] = {
          target: 'http://localhost:3100/_studio',
          changeOrigin: true,
          followRedirects: true,
          rewrite: path => path.replace(/^\/_studio/, '')
        }
      })
    }

    // TODO: All below could be simplified with `extends: @nuxt/studio` with a separate chunk
    await addComponentsDir({
      path: resolve('./runtime/components')
    })

    // @ts-ignore
    await installModule(meta)

    addServerHandler({
      method: 'get',
      route: '/api/_studio',
      handler: resolve('./runtime/server/api/index')
    })
    addServerHandler({
      method: 'get',
      route: '/api/_studio/components',
      handler: resolve('./runtime/server/api/components')
    })

    // Dev server handlers (tree & content management)
    if (nuxt.options.dev) {
      nuxt.options.nitro.alias = nuxt.options.nitro.alias || {}
      nuxt.options.nitro.alias['#studio/server/utils'] = resolve('./runtime/server/utils')
      addServerHandler({
        method: 'get',
        route: '/api/_studio/content/files',
        handler: resolve('./runtime/server/api/content/files.get')
      })
      addServerHandler({
        method: 'get',
        route: '/api/_studio/content/navigation',
        handler: resolve('./runtime/server/api/content/navigation.get')
      })
      addServerHandler({
        method: 'get',
        route: '/api/_studio/content/tree',
        handler: resolve('./runtime/server/api/content/tree.get')
      })

      for (const method of ['get', 'post', 'delete']) {
        const handler = resolve(`./runtime/server/api/content/[id].${method}`)
        addServerHandler({
          method,
          route: '/api/_studio/content/**:id',
          handler
        })
        addServerHandler({
          method,
          route: '/api/_studio/content/:id',
          handler
        })
      }
    }

    addPlugin(resolve('./runtime/plugins/iframe.client'))
    addPlugin(resolve('./runtime/plugins/preview-detector'))

    if (!nuxt.options.dev) {
      nuxt.options.nitro.prerender = nuxt.options.nitro.prerender || {}
      nuxt.options.nitro.prerender.routes = nuxt.options.nitro.prerender.routes || []
      nuxt.options.nitro.prerender.routes.push('/api/_studio/components')
      nuxt.options.nitro.prerender.routes.push('/api/_studio')
    }

    extendViteConfig((config) => {
      config.optimizeDeps = config.optimizeDeps || {}
      config.optimizeDeps.include = config.optimizeDeps.include || []
      config.optimizeDeps.include.push(...[
        'socket.io-client'
      ])
    })

    // Serve Studio Client /_studio/ using Nitro
    const studioUI = resolve('../ui/.output/public')
    const dirStat = await stat(studioUI).catch(() => null)
    // Production mode
    if (dirStat?.isDirectory()) {
      nuxt.options.nitro.publicAssets = nuxt.options.nitro.publicAssets || []
      nuxt.options.nitro.publicAssets.push({
        baseURL: '/_studio/',
        dir: studioUI
      })
      // Production API?
      // TODO: this does not work and throw this error
      // Cannot start nuxt:  Cannot find module 'studio.nuxt.com/module/app/.output/server/node_modules/node-fetch-native/dist/polyfill.cjs'
      // const studioServer = await import('../app/.output/server/index.mjs')
      // console.log('studioServer', studioServer)
      // addServerHandler(studioServer)

      nuxt.hook('listen', (_, listener) => {
        const viewerUrl = `${withoutTrailingSlash(listener.url)}/_studio/`
        // eslint-disable-next-line no-console
        console.log(`  > Studio: \`${viewerUrl}\`\n`)
      })
    } else {
      // Studio Development mode
      // TODO: would be possible with extends supporting an separate app entrypoint
      log.warn('Could not inject Nuxt Studio application, please run `yarn build`')
      log.info([
        'To develop Nuxt Studio:',
        '  - Change directory to `./module`',
        '  - Run `yarn play`',
        '  - Copy `app/.env.example` to `app/.env` and adjust based on playground port',
        '  - Run `yarn dev` on another terminal and open studio url',
        ''
      ].join('\n'))
    }
  }
})
