import { consola } from 'consola'
import { defineNuxtConfig } from 'nuxt/config'

export default defineNuxtConfig({
  extends: '@nuxt/ui-pro',
  modules: ['@nuxt/ui', '@nuxt/content', '../src/module', '@nuxt/image'],
  studio: {
    enabled: true,
  },
  hooks: {
    // Set all components to global
    'components:extend': () => {
      // components.forEach(component => {
      //   if (component.pascalName[0] === 'U') {
      //     component.global = true
      //   }
      // })
    },
    'listen': async (_, { getURLs }) => {
      const urls = await getURLs()
      const tunnelURL = urls.find((u: { type: string }) => u.type === 'tunnel')
      if (!tunnelURL) return consola.warn('Could not get Tunnel URL')
      consola.box(
        'Nuxt Studio Playground Ready.\n\n'
        + '1. Go to https://nuxt.studio/@studio/studio-module\n'
        + '2. Paste `' + tunnelURL.url + '` in the Deployed URL field\n'
        + '3. Play with the Studio Playground!',
      )
    },
  },
})
