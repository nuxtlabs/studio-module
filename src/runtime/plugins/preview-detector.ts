import { createApp } from 'vue'
import { defineNuxtPlugin, useRuntimeConfig, useRoute, useCookie } from '#imports'
import { ContentPreviewMode } from '#components'

export default defineNuxtPlugin((nuxtApp) => {
  const { studio } = useRuntimeConfig().public
  // If studio configured with API URL
  if (studio?.apiURL) {
    const { query } = useRoute()
    const previewToken = useCookie('previewToken', { sameSite: 'none', secure: true })

    // If opening a preview link
    if (query._preview) {
      // Set the preview cookie
      previewToken.value = String(query._preview)
    }

    if (process.client && previewToken.value) {
      // eslint-disable-next-line no-console
      console.info('👀 Preview mode activated:', previewToken.value)

      nuxtApp.hooks.hookOnce('app:mounted', () => {
        const wrapper = document.createElement('div')
        wrapper.id = '__nuxt_preview_wrapper'
        document.body.appendChild(wrapper)
        createApp(ContentPreviewMode, { previewToken, apiURL: studio.apiURL }).mount(wrapper)
      })
    }
  }
})
