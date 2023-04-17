import { createApp } from 'vue'
import type { Storage } from 'unstorage'
import type { ParsedContent } from '@nuxt/content/dist/runtime/types'
import { defu } from 'defu'
// @ts-ignore
import { callWithNuxt } from '#app'
import type { RouteLocationNormalized } from 'vue-router'
import ContentPreviewMode from '../components/ContentPreviewMode.vue'
import { createSingleton, deepAssign, deepDelete, mergeDraft, StudioConfigFiles, StudioConfigRoot } from '../utils'
import { refreshNuxtData, useAppConfig, useNuxtApp, useRuntimeConfig, useState, useContentState, queryContent, ref, toRaw, useRoute, useRouter } from '#imports'
import type { PreviewFile, PreviewResponse } from '~~/../types'
import { FileChangeMessagePayload } from '~~/../types'

const useDefaultAppConfig = createSingleton(() => JSON.parse(JSON.stringify((useAppConfig()))))

export const useStudio = () => {
  const nuxtApp = useNuxtApp()
  const { studio: studioConfig, content: contentConfig } = useRuntimeConfig().public
  const route = useRoute()

  // App config (required)
  const initialAppConfig = useDefaultAppConfig()
  let initialTokensConfig: object

  const storage = useState<Storage | null>('studio-client-db', () => null)
  const dbFiles = useState<PreviewFile[]>('studio-preview-db-files', () => [])

  if (!storage.value) {
    // @ts-ignore
    nuxtApp.hook('content:storage', (_storage: Storage) => {
      storage.value = _storage
    })

    // Call `queryContent` to trigger `content:storage` hook
    queryContent('/non-existing-path').findOne()
  }

  const syncPreviewFiles = async (contentStorage: Storage, files: PreviewFile[], ignoreBuiltContents = true) => {
    const previewToken = window.sessionStorage.getItem('previewToken')
    // Remove previous preview data
    const keys: string[] = await contentStorage.getKeys(`${previewToken}:`)
    await Promise.all(keys.map(key => contentStorage.removeItem(key)))

    // Set preview meta
    const sources = new Set<string>(files.map(file => file.parsed!._id.split(':').shift()!))
    await contentStorage.setItem(`${previewToken}$`, JSON.stringify({ ignoreSources: Array.from(sources) }))

    // Handle content files
    await Promise.all(
      files.map(item => contentStorage.setItem(`${previewToken}:${item.parsed!._id}`, JSON.stringify(item.parsed)))
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
    const previewToken = window.sessionStorage.getItem('previewToken')
    // Fetch preview data from station
    await $fetch<PreviewResponse>('api/projects/preview/sync', {
      baseURL: studioConfig?.apiURL,
      method: 'POST',
      params: {
        token: previewToken
      }
    }) as any
  }

  const mountPreviewUI = () => {
    const previewToken = window.sessionStorage.getItem('previewToken')
    // Show loading
    const el = document.createElement('div')
    el.id = '__nuxt_preview_wrapper'
    document.body.appendChild(el)
    createApp(ContentPreviewMode, {
      previewToken,
      apiURL: studioConfig?.apiURL,
      syncPreview,
      requestPreviewSyncAPI: requestPreviewSynchronization
    }).mount(el)
  }

  // Content Helpers
  const findContentWithId = async (path: string): Promise<ParsedContent | null> => {
    const previewToken = window.sessionStorage.getItem('previewToken')
    if (!path) {
      return null
    }
    path = path.replace(/\/$/, '')
    let content = await storage.value?.getItem(`${previewToken}:${path}`)
    if (!content) {
      content = await storage.value?.getItem(`cached:${path}`)
    }
    if (!content) {
      content = content = await storage.value?.getItem(path)
    }
    return content as ParsedContent
  }

  const updateContent = (content: PreviewFile) => {
    const previewToken = window.sessionStorage.getItem('previewToken')
    if (!storage.value) { return }

    storage.value.setItem(`${previewToken}:${content.parsed?._id}`, JSON.stringify(content.parsed))
  }

  const removeContentWithId = async (path: string) => {
    const previewToken = window.sessionStorage.getItem('previewToken')
    await storage.value?.removeItem(`${previewToken}:${path}`)
  }

  const requestRerender = async () => {
    if (contentConfig?.documentDriven) {
      // Update all cached pages
      const { pages } = callWithNuxt<any>(nuxtApp, useContentState)
      for (const key in pages.value) {
        if (pages.value[key]) {
          pages.value[key] = await findContentWithId(pages.value[key]._id)
        }
      }
    }
    callWithNuxt(nuxtApp, refreshNuxtData)
  }

  return {
    apiURL: studioConfig?.apiURL,
    contentStorage: storage,

    syncPreviewFiles,
    syncPreviewAppConfig,
    syncPreviewTokensConfig,
    requestPreviewSynchronization,

    findContentWithId,
    updateContent,
    removeContentWithId,

    requestRerender,

    mountPreviewUI,
    initiateIframeCommunication
  }

  function initiateIframeCommunication () {
    // Not in an iframe
    if (!window.parent || window.self === window.parent) {
      return
    }
    const router = useRouter()

    const editorSelectedPath = ref('')
    const isDocumentDrivenInitialHook = ref(true)

    // Evaluate route payload
    const routePayload = (route: RouteLocationNormalized) => ({
      path: route.path,
      query: toRaw(route.query),
      params: toRaw(route.params),
      fullPath: route.fullPath,
      meta: toRaw(route.meta)
    })

    window.addEventListener('keydown', (e) => {
      if (e.metaKey || e.ctrlKey || e.altKey || e.shiftKey) {
        window.parent.postMessage({
          type: 'nuxt-studio:preview:keydown',
          payload: {
            key: e.key,
            metaKey: e.metaKey,
            ctrlKey: e.ctrlKey,
            shiftKey: e.shiftKey,
            altKey: e.altKey
          }
        }, '*')
      }
    })

    window.addEventListener('message', async (e) => {
      const { type, payload = {} } = e.data || {}

      switch (type) {
        case 'nuxt-studio:editor:file-selected': {
          const content = await findContentWithId(payload.path)
          if (!content) {
          // DO not navigate to another page if content is not found
          // This makes sure that user stays on the same page when navigation through directories in the editor
          } else if (content._partial) {
          // Partials should use as helpers for other content files, like `_dir.yml`
          // We should not navigate if content is a partial
          } else if (content._path !== useRoute().path) {
            editorSelectedPath.value = content._path!
            router.push(content._path!)
          }
          break
        }
        case 'nuxt-studio:editor:file-changed': {
          const { additions = [], deletions = [] } = payload as FileChangeMessagePayload
          for (const addition of additions) {
            await updateContent(addition)
          }
          for (const deletion of deletions) {
            await removeContentWithId(deletion.path)
          }
          requestRerender()
          break
        }
        case 'nuxt-studio:preview:sync': {
          syncPreview(payload)
          break
        }
        case 'nuxt-studio:config:file-changed': {
          const { additions = [], deletions = [] } = payload as FileChangeMessagePayload
          // Handle `.studio/app.config.json`
          const appConfig = additions.find(item => item.path === StudioConfigFiles.appConfig)
          if (appConfig) {
            syncPreviewAppConfig(appConfig?.parsed)
          }
          const shouldRemoveAppConfig = deletions.find(item => item.path === StudioConfigFiles.appConfig)
          if (shouldRemoveAppConfig) {
            syncPreviewAppConfig(undefined)
          }

          // Handle `.studio/tokens.config.json`
          const tokensConfig = additions.find(item => item.path === StudioConfigFiles.tokensConfig)
          if (tokensConfig) {
            syncPreviewTokensConfig(tokensConfig?.parsed)
          }
          const shouldRemoveTokensConfig = deletions.find(item => item.path === StudioConfigFiles.tokensConfig)
          if (shouldRemoveTokensConfig) {
            syncPreviewTokensConfig(undefined)
          }
          break
        }
      }
    })

    // @ts-ignore
    nuxtApp.hook('content:document-driven:finish', ({ route, page, dedup }) => {
      if (dedup || isDocumentDrivenInitialHook.value) {
        isDocumentDrivenInitialHook.value = false
        return
      }

      // Ignore if navigating from editor
      if (page && editorSelectedPath.value === page._path) {
        editorSelectedPath.value = ''
        return
      }

      window.parent.postMessage({
        type: 'nuxt-studio:preview:document-driven:finish',
        payload: {
          ...routePayload(route),
          contentId: page?._id
        }
      }, '*')
    })

    // @ts-ignore
    nuxtApp.hook('nuxt-studio:preview:ready', () => {
      window.parent.postMessage({
        type: 'nuxt-studio:preview:ready',
        payload: routePayload(useRoute())
      }, '*')

      router?.afterEach((to: any) => {
        window.parent.postMessage({
          type: 'nuxt-studio:preview:route-changed',
          payload: routePayload(to)
        }, '*')
      })
    })
  }
}
