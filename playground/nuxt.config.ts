import { defineNuxtConfig } from 'nuxt/config'

export default defineNuxtConfig({
  extends: '@nuxt-themes/alpine',
  modules: [
    // TODO: module functions are not supported yet
    '../src/module'
  ],
  studio: {
    enabled: true
  }
  // app: {
  //   baseURL: '/test/'
  // }
})
