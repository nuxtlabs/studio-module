import type { Ref } from 'vue'
import { createApp, computed } from 'vue'
import type { Storage } from 'unstorage'
import type { ParsedContent } from '@nuxt/content/dist/runtime/types'
// @ts-ignore
import ContentPreviewMode from '../components/ContentPreviewMode.vue'
import { createSingleton, mergeDraft } from '../utils'

import { callWithNuxt } from '#app'
import { refreshNuxtData, updateAppConfig, useAppConfig, useCookie, useNuxtApp, useRoute, useRuntimeConfig, useState } from '#imports'
import type { PreviewFile, PreviewResponse } from '~~/../types'

export const useStudio = createSingleton(() => {
  const nuxtApp = useNuxtApp()
  const initialAppConfig = { ...useAppConfig() }
  const runtimeConfig = useRuntimeConfig().public.studio || {}
  const storage = useState<Storage | null>('client-db', () => null)

  const previewToken = useCookie('previewToken', { sameSite: 'none', secure: true })

  const syncPreviewFiles = async (contentStorage: Storage, files: PreviewFile[], ignoreBuiltContents = true) => {
    // Remove previous preview data
    const keys: string[] = await contentStorage.getKeys(`${previewToken.value}:`)
    await Promise.all(keys.map(key => contentStorage.removeItem(key)))

    // Set preview meta
    await contentStorage.setItem(
      `${previewToken.value}$`,
      JSON.stringify({
        ignoreBuiltContents
      })
    )

    // Handle content files
    await Promise.all(
      files.map(item => contentStorage.setItem(`${previewToken.value}:${item.parsed?._id}`, JSON.stringify(item.parsed)))
    )
  }

  const syncPreviewAppConfig = (appConfig?: any) => {
    callWithNuxt(nuxtApp, updateAppConfig, [appConfig || initialAppConfig])
  }

  const syncPreview = async (contentStorage: Storage) => {
    // Fetch preview data from station
    const data = await $fetch<PreviewResponse>('api/projects/preview', {
      baseURL: runtimeConfig.apiURL,
      params: {
        token: previewToken.value
      }
    }) as any

    const mergedFiles = mergeDraft(data.files, data.additions, data.deletions)

    // Handle content files
    const contentFiles = mergedFiles.filter(item => item.path.startsWith('content'))
    await syncPreviewFiles(contentStorage, contentFiles, (data.files || []).length !== 0)

    const dotStudioFiles = mergedFiles.filter(item => item.path.startsWith('.studio'))

    // Handle `.studio/app.config.json`
    const appConfig = dotStudioFiles.find(item => item.path === '.studio/app.config.json')
    syncPreviewAppConfig(appConfig?.parsed)
  }

  const requestPreviewSynchronization = async () => {
    // Fetch preview data from station
    await $fetch<PreviewResponse>('api/projects/preview/sync', {
      baseURL: runtimeConfig.apiURL,
      method: 'POST',
      params: {
        token: previewToken.value
      }
    }) as any
  }

  const mountPreviewUI = (storage: Ref<Storage | null>) => {
    const storageReady = computed(() => !!storage.value)
    // Show loading
    const el = document.createElement('div')
    el.id = '__nuxt_preview_wrapper'
    document.body.appendChild(el)
    createApp(ContentPreviewMode, {
      previewToken,
      apiURL: runtimeConfig.apiURL,
      storageReady,
      refresh: () => syncPreview(storage.value!).then(() => refreshNuxtData()),
      init: requestPreviewSynchronization
    }).mount(el)
  }

  const findContentWithId = async (path: string): Promise<ParsedContent | null> => {
    if (!path) {
      return null
    }
    path = path.replace(/\/$/, '')
    let content = await storage.value?.getItem(`${previewToken.value}:${path}`)
    if (!content) {
      content = await storage.value?.getItem(path)
    }
    return content as ParsedContent
  }

  return {
    apiURL: runtimeConfig.apiURL,
    previewToken,
    contentStorage: storage,

    syncPreview,
    syncPreviewFiles,
    syncPreviewAppConfig,
    requestPreviewSynchronization,

    mountPreviewUI,

    findContentWithId
  }
})
