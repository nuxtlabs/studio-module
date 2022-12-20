import type { Storage } from 'unstorage'
import { NuxtApp } from 'nuxt/app'
import { defineNuxtPlugin, useState, refreshNuxtData, useCookie, useRoute, useRuntimeConfig } from '#imports'

export default defineNuxtPlugin((nuxtApp: NuxtApp) => {
  const contentStorage = useState<Storage | null>('client-db', () => null)
  const runtimeConfig = useRuntimeConfig().public.studio || {}
  const route = useRoute()
  const previewToken = useCookie('previewToken', { sameSite: 'none', secure: true })

  async function initializePreview () {
    // This is required to enable client-db initialization inside Content Module
    // In the intialization process of client-db, it will call
    // `content:storage` hook to get the storage instance
    nuxtApp.hook('page:finish', () => {
      // Refresh nuxt data
      refreshNuxtData()

      // @ts-ignore
      nuxtApp.hook('content:storage', (storage: Storage) => {
        contentStorage.value = storage
      })
    })

    const useStudio = await import('../composables/useStudio').then(m => m.useStudio)
    const { mountPreviewUI } = useStudio()

    mountPreviewUI(contentStorage)
  }

  if (runtimeConfig.apiURL) {
    // Disable preview mode if token value is null, undefined or empty
    if (Object.prototype.hasOwnProperty.call(route.query, 'preview') && !route.query.preview) {
      return false
    }

    if (!route.query.preview && !previewToken.value) {
      return false
    }

    if (route.query.preview && previewToken.value !== route.query.preview) {
      previewToken.value = String(route.query.preview)
    }

    nuxtApp.hook('app:mounted', async () => {
      await initializePreview()
    })
  }
})
