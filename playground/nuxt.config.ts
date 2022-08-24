import { defineNuxtConfig } from 'nuxt'
import nuxtStudio from '../src/module'

export default defineNuxtConfig({
  extends: '@nuxt-themes/elements-edge',
  modules: [
    nuxtStudio,
    '@nuxt/content'
  ],
  content: {
    documentDriven: true,
    highlight: {
      theme: 'dracula'
    }
  }
})
