import * as preset from './ui.preset'

export default defineNuxtConfig({
  ssr: false,
  app: {
    baseURL: '/_studio/'
  },
  experimental: {
    reactivityTransform: true
  },
  components: [
    '~/components',
    { path: '~/views', global: true }
  ],
  modules: [
    '@nuxthq/ui',
    '@vueuse/nuxt'
  ],
  ui: {
    preset,
    colors: {
      primary: 'primary',
      gray: 'zinc'
    }
  },
  runtimeConfig: {
    public: {
      studio: {
        apiURL: process.env.API_URL || '/api/_studio'
      }
    }
  },
  hooks: {
    'modules:before': () => {
      if (process.env.NODE_ENV === 'development') {
        // eslint-disable-next-line no-console
        console.log(`  > Nuxt Studio linked to: \`${process.env.API_URL}\`\n`)
      }
    }
  }
})
