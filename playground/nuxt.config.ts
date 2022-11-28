import { defineNuxtConfig } from 'nuxt/config'

export default defineNuxtConfig({
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
