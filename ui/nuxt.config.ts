import { defineNuxtConfig } from 'nuxt'
import * as preset from './ui.preset'

export default defineNuxtConfig({
  ssr: false,
  extends: [
    // '../../shared'
  ],
  components: [
    '~/components',
    '../../platform/components'
  ],
  app: {
    baseURL: '/_studio/'
  },
  modules: [
    '@nuxthq/ui'
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
  autoImports: {
    dirs: [
      // Scan composables from nested directories
      'composables/useEditor',
      'composables/useEditorScroll'
    ]
  },
  experimental: {
    viteNode: true
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
