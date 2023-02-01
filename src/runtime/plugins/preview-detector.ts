// @ts-ignore
import { defineNuxtPlugin, useCookie, useRoute, useRuntimeConfig, queryContent } from '#imports'

export default defineNuxtPlugin((nuxtApp) => {
  const runtimeConfig = useRuntimeConfig().public.studio || {}
  const route = useRoute()
  const previewToken = useCookie('previewToken', { sameSite: 'none', secure: true })

  async function initializePreview () {
    const useStudio = await import('../composables/useStudio').then(m => m.useStudio)
    const { mountPreviewUI } = useStudio()

    mountPreviewUI()

    // Call `queryContent` to trigger `content:storage` hook
    queryContent('/non-existing-path').findOne()
  }

  if (runtimeConfig.apiURL) {
    // Disable preview mode if token value is null, undefined or empty
    if (Object.prototype.hasOwnProperty.call(route.query, 'preview') && !route.query.preview) {
      return
    }

    if (!route.query.preview && !previewToken.value) {
      return
    }

    if (route.query.preview && previewToken.value !== route.query.preview) {
      previewToken.value = String(route.query.preview)
    }

    nuxtApp.hook('app:mounted', async () => {
      await initializePreview()
    })
  }
})
