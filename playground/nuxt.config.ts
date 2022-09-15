import nuxtStudio from '../src/module'

export default defineNuxtConfig({
  extends: '@nuxt-themes/elements-edge',
  modules: [
    '@nuxt/content',
    nuxtStudio
  ],
  content: {
    documentDriven: true,
    highlight: {
      theme: 'dracula'
    }
  }
})
