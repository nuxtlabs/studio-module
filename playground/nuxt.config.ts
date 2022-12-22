import { defineNuxtConfig } from 'nuxt/config'

export default defineNuxtConfig({
  $schema: {
    appConfig: {
      configFromNuxtConfig: true
    }
  },
  modules: [
    '@nuxt/content',
    '@nuxtjs/color-mode',
    'pinceau/nuxt',
    // TODO: module functions are not supported yet
    '../src/module'
  ],
  pinceau: {
    studio: true,
    preflight: false,
    configFileName: 'tokens.config'
  },
  content: {
    documentDriven: true,
    highlight: {
      theme: {
        default: 'github-light',
        dark: 'github-dark'
      }
    }
  },
  studio: {
    enabled: true
  }
  // app: {
  //   baseURL: '/test/'
  // }
})
