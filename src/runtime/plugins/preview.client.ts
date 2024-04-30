import { defineNuxtPlugin, useCookie, useRoute, useRuntimeConfig, useState } from '#imports'
// @ts-expect-error import does exist
import type { NuxtApp } from '#app'

export default defineNuxtPlugin((nuxtApp: NuxtApp) => {
  const runtimeConfig = useRuntimeConfig().public.studio || {}
  const route = useRoute()
  const previewToken = useCookie('previewToken', { sameSite: 'none', secure: true })
  const storage = useState<Storage | null>('studio-client-db', () => null)

  async function initializePreview() {
    const useStudio = await import('../composables/useStudio').then(m => m.useStudio)
    const { mountPreviewUI, initiateIframeCommunication } = useStudio()

    mountPreviewUI()

    initiateIframeCommunication()
  }

  if (runtimeConfig.apiURL) {
    // Disable preview mode if token value is null, undefined or empty
    if (Object.prototype.hasOwnProperty.call(route.query, 'preview') && !route.query.preview) {
      return
    }

    if (!route.query.preview && !previewToken.value) {
      return
    }

    if (route.query.preview) {
      previewToken.value = String(route.query.preview)
    }
    window.sessionStorage.setItem('previewToken', String(previewToken.value))
    window.sessionStorage.setItem('previewAPI', typeof route.query.staging !== 'undefined' ? 'https://dev-api.nuxt.studio' : runtimeConfig.apiURL)

    // Listen to `content:storage` hook to get storage instance
    // There is some cases that `content:storage` hook is called before initializing preview
    nuxtApp.hook('content:storage', (_storage: Storage) => {
      storage.value = _storage
    })

    nuxtApp.hook('app:mounted', async () => {
      await initializePreview()
    })
  }
})
