import { defineNuxtConfig } from 'nuxt/config'

export default defineNuxtConfig({
  modules: [
    '@nuxt/content',
    '../src/module'
  ],
  content: {
    documentDriven: true,
    highlight: {
      theme: 'dracula'
    }
  }
})
