import { defineNuxtConfig } from 'nuxt/config'

export default defineNuxtConfig({
  appConfig: {
    configFromNuxtConfig: true
  },
  modules: [
    '@nuxt/content',
    // TODO: module functions are not supported yet
    '../src/module'
  ],
  content: {
    documentDriven: true,
    highlight: {
      theme: 'dracula'
    }
  }
})
