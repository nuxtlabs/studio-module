import { defineNuxtConfig } from 'nuxt/config'

export default defineNuxtConfig({
  extends: '@nuxt-themes/alpine',
  $schema: {
    appConfig: {
      configFromNuxtConfig: true
    }
  },
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
