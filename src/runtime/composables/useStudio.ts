import { createApp } from 'vue'
import type { Storage } from 'unstorage'
import type { ParsedContent } from '@nuxt/content/dist/runtime/types'
import defu from 'defu'
// @ts-ignore
import ContentPreviewMode from '../components/ContentPreviewMode.vue'
import { createSingleton, deepAssign, deepDelete, mergeDraft, StudioConfigFiles, StudioConfigRoot } from '../utils'
// eslint-disable-next-line import/order
import { callWithNuxt } from '#app'
import { refreshNuxtData, useAppConfig, useCookie, useNuxtApp, useRuntimeConfig, useState } from '#imports'
import type { PreviewFile, PreviewResponse } from '~~/../types'

const useDefaultAppConfig = createSingleton(() => JSON.parse(JSON.stringify((useAppConfig()))))

export const useStudio = () => {
  const nuxtApp = useNuxtApp()
  const runtimeConfig = useRuntimeConfig().public.studio || {}

  // App config (required)
  const initialAppConfig = useDefaultAppConfig()
  let initialTokensConfig: object

  const storage = useState<Storage | null>('studio-client-db', () => null)
  const dbFiles = useState<PreviewFile[]>('studio-preview-db-files', () => [])

  // @ts-ignore
  nuxtApp.hook('content:storage', (_storage: Storage) => {
    storage.value = _storage
  })

  const syncPreviewFiles = async (contentStorage: Storage, files: PreviewFile[], ignoreBuiltContents = true) => {
    const previewToken = useCookie('previewToken', { sameSite: 'none', secure: true })
    // Remove previous preview data
    const keys: string[] = await contentStorage.getKeys(`${previewToken.value}:`)
    await Promise.all(keys.map(key => contentStorage.removeItem(key)))

    // Set preview meta
    const sources = new Set<string>(files.map(file => file.parsed!._id.split(':').shift()!))
    await contentStorage.setItem(`${previewToken.value}$`, JSON.stringify({ ignoreSources: Array.from(sources) }))

    // Handle content files
    await Promise.all(
      files.map(item => contentStorage.setItem(`${previewToken.value}:${item.parsed!._id}`, JSON.stringify(item.parsed)))
    )
  }

  const syncPreviewAppConfig = (appConfig?: any) => {
    const _appConfig = callWithNuxt(nuxtApp, useAppConfig)
    // Using `defu` to merge with initial config
    // This is important to revert to default values for missing properties
    deepAssign(_appConfig, defu(appConfig, initialAppConfig))

    // Reset app config to initial state if no appConfig is provided
    // Makes sure that app config does not contain any preview data
    if (!appConfig) {
      deepDelete(_appConfig, initialAppConfig)
    }
  }

  const syncPreviewTokensConfig = (tokensConfig?: any) => {
    // Tokens config (optional; depends on the presence of pinceauTheme provide)
    // TODO: Improve typings
    // TODO: Use `inject()` but wrong context seem to be resolved; while $pinceauTheme global property is present in `app` context
    const themeSheet = nuxtApp?.vueApp?._context?.config?.globalProperties?.$pinceauTheme

    // Pinceau might be not present, or not booted yet
    if (!themeSheet || !themeSheet?.updateTheme) { return }

    // Set initial tokens config on first call
    if (!initialTokensConfig) {
      initialTokensConfig = JSON.parse(JSON.stringify(themeSheet?.theme.value || {}))
    }

    // Call updateTheme with new config
    callWithNuxt(
      nuxtApp,
      themeSheet.updateTheme, [
        // Using `defu` to merge with initial tokens
        // This is important to revert to default values for missing properties
        defu(tokensConfig, initialTokensConfig)
      ]
    )
  }

  const syncPreview = async (data: PreviewResponse) => {
    // Preserve db files for later use in `draft:update` events
    dbFiles.value = data.files = data.files || dbFiles.value || []

    if (!storage.value) {
      // Postpone sync if storage is not ready
      return false
    }

    const mergedFiles = mergeDraft(data.files, data.additions, data.deletions)

    // Handle content files
    const contentFiles = mergedFiles.filter(item => !item.path.startsWith(StudioConfigRoot))
    await syncPreviewFiles(storage.value, contentFiles, (data.files || []).length !== 0)

    // Handle `.studio/app.config.json`
    const appConfig = mergedFiles.find(item => item.path === StudioConfigFiles.appConfig)
    syncPreviewAppConfig(appConfig?.parsed)

    // Handle `.studio/tokens.config.json`
    const tokensConfig = mergedFiles.find(item => item.path === StudioConfigFiles.tokensConfig)
    syncPreviewTokensConfig(tokensConfig?.parsed)

    requestRerender()

    return true
  }

  const requestPreviewSynchronization = async () => {
    const previewToken = useCookie('previewToken', { sameSite: 'none', secure: true })
    // Fetch preview data from station
    await $fetch<PreviewResponse>('api/projects/preview/sync', {
      baseURL: runtimeConfig.apiURL,
      method: 'POST',
      params: {
        token: previewToken.value
      }
    }) as any
  }

  const mountPreviewUI = () => {
    const previewToken = useCookie('previewToken', { sameSite: 'none', secure: true })
    // Show loading
    const el = document.createElement('div')
    el.id = '__nuxt_preview_wrapper'
    document.body.appendChild(el)
    createApp(ContentPreviewMode, {
      previewToken,
      apiURL: runtimeConfig.apiURL,
      syncPreview,
      requestPreviewSyncAPI: requestPreviewSynchronization
    }).mount(el)
  }

  // Content Helpers
  const findContentWithId = async (path: string): Promise<ParsedContent | null> => {
    const previewToken = useCookie('previewToken', { sameSite: 'none', secure: true })
    if (!path) {
      return null
    }
    path = path.replace(/\/$/, '')
    let content = await storage.value?.getItem(`${previewToken.value}:${path}`)
    if (!content) {
      content = await storage.value?.getItem(`cached:${path}`)
    }
    if (!content) {
      content = content = await storage.value?.getItem(path)
    }
    return content as ParsedContent
  }

  const updateContent = (content: PreviewFile) => {
    const previewToken = useCookie('previewToken', { sameSite: 'none', secure: true })
    if (!storage.value) { return }

    storage.value.setItem(`${previewToken.value}:${content.parsed?._id}`, JSON.stringify(content.parsed))
  }

  const removeContentWithId = async (path: string) => {
    const previewToken = useCookie('previewToken', { sameSite: 'none', secure: true })
    await storage.value?.removeItem(`${previewToken.value}:${path}`)
  }

  const requestRerender = () => {
    callWithNuxt(nuxtApp, refreshNuxtData)
  }

  return {
    apiURL: runtimeConfig.apiURL,
    contentStorage: storage,

    syncPreviewFiles,
    syncPreviewAppConfig,
    syncPreviewTokensConfig,
    requestPreviewSynchronization,

    mountPreviewUI,

    findContentWithId,
    updateContent,
    removeContentWithId,

    requestRerender
  }
}
