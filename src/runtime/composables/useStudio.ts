import { createApp } from 'vue'
import type { Storage } from 'unstorage'
import type { ParsedContent } from '@nuxt/content/dist/runtime/types'
import { createDefu } from 'defu'
import type { RouteLocationNormalized } from 'vue-router'
import type { AppConfig } from 'nuxt/schema'
import ContentPreviewMode from '../components/ContentPreviewMode.vue'
import { createSingleton, deepAssign, deepDelete, mergeDraft, StudioConfigFiles } from '../utils'
import type { PreviewFile, PreviewResponse, FileChangeMessagePayload } from '../types'
import { callWithNuxt } from '#app'
import { useAppConfig, useNuxtApp, useRuntimeConfig, useState, useContentState, queryContent, ref, toRaw, useRoute, useRouter } from '#imports'

const useDefaultAppConfig = createSingleton(() => JSON.parse(JSON.stringify((useAppConfig()))))

const defu = createDefu((obj, key, value) => {
  if (Array.isArray(obj[key]) && Array.isArray(value)) {
    obj[key] = value
    return true
  }
})

let dbFiles: PreviewFile[] = []

export const useStudio = () => {
  const nuxtApp = useNuxtApp()
  const { studio: studioConfig, content: contentConfig } = useRuntimeConfig().public
  const contentPathMap = {} as Record<string, ParsedContent>
  const apiURL = window.sessionStorage.getItem('previewAPI') || studioConfig?.apiURL

  // App config (required)
  const initialAppConfig = useDefaultAppConfig()
  let initialTokensConfig: object

  const storage = useState<Storage | null>('studio-client-db', () => null)

  if (!storage.value) {
    // @ts-expect-error custom hook
    nuxtApp.hook('content:storage', (_storage: Storage) => {
      storage.value = _storage
    })

    // Call `queryContent` to trigger `content:storage` hook
    queryContent('/non-existing-path').findOne()
  }

  const syncPreviewFiles = async (contentStorage: Storage, files: PreviewFile[]) => {
    const previewToken = window.sessionStorage.getItem('previewToken')
    // Remove previous preview data
    const keys: string[] = await contentStorage.getKeys(`${previewToken}:`)
    await Promise.all(keys.map(key => contentStorage.removeItem(key)))

    // Set preview meta
    const sources = new Set<string>(files.map(file => file.parsed!._id.split(':').shift()!))
    await contentStorage.setItem(`${previewToken}$`, JSON.stringify({ ignoreSources: Array.from(sources) }))

    // Handle content files
    await Promise.all(
      files.map((item) => {
        contentPathMap[item.parsed!._path!] = item.parsed!
        return contentStorage.setItem(`${previewToken}:${item.parsed!._id}`, JSON.stringify(item.parsed))
      }),
    )
  }

  const syncPreviewAppConfig = (appConfig?: ParsedContent) => {
    const _appConfig = callWithNuxt(nuxtApp, useAppConfig) as AppConfig

    // Set dynamic icons for preview if user is using @nuxt/ui
    if (_appConfig?.ui) {
      (_appConfig.ui as Record<string, unknown>).icons = { ...(_appConfig.ui as Record<string, unknown>).icons as AppConfig, dynamic: true }
    }

    // Using `defu` to merge with initial config
    // This is important to revert to default values for missing properties
    deepAssign(_appConfig, defu(appConfig as ParsedContent, initialAppConfig))

    // Reset app config to initial state if no appConfig is provided
    // Makes sure that app config does not contain any preview data
    if (!appConfig) {
      deepDelete(_appConfig, initialAppConfig)
    }
  }

  const syncPreviewTokensConfig = (tokensConfig?: ParsedContent) => {
    // Tokens config (optional; depends on the presence of pinceauTheme provide)
    // TODO: Improve typings
    // TODO: Use `inject()` but wrong context seem to be resolved; while $pinceauTheme global property is present in `app` context
    const themeSheet = nuxtApp?.vueApp?._context?.config?.globalProperties?.$pinceauTheme as Record<string, unknown>

    // Pinceau might be not present, or not booted yet
    if (!themeSheet || !themeSheet?.updateTheme) return

    // Set initial tokens config on first call
    if (!initialTokensConfig) {
      initialTokensConfig = JSON.parse(JSON.stringify((themeSheet?.theme as Record<string, unknown>).value || {}))
    }

    // Call updateTheme with new config
    callWithNuxt(
      nuxtApp,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      themeSheet.updateTheme as any,
      [
        // Using `defu` to merge with initial tokens
        // This is important to revert to default values for missing properties
        defu(tokensConfig as ParsedContent, initialTokensConfig),
      ],
    )
  }

  const syncPreview = async (data: PreviewResponse) => {
    // Preserve db files in case storage is not ready yet (see check below)
    dbFiles = data.files = data.files || dbFiles || []

    if (!storage.value) {
      // Postpone sync if storage is not ready
      return false
    }

    // Empty dbFiles array once storage is ready
    dbFiles = []

    const mergedFiles = mergeDraft(data.files, data.additions, data.deletions)

    // Handle content files
    const contentFiles = mergedFiles.filter(item => !([StudioConfigFiles.appConfig, StudioConfigFiles.nuxtConfig, StudioConfigFiles.tokensConfig].includes(item.path)))
    await syncPreviewFiles(storage.value, contentFiles)

    const appConfig = mergedFiles.find(item => item.path === StudioConfigFiles.appConfig)
    syncPreviewAppConfig(appConfig?.parsed as ParsedContent)

    const tokensConfig = mergedFiles.find(item => item.path === StudioConfigFiles.tokensConfig)
    syncPreviewTokensConfig(tokensConfig?.parsed as ParsedContent)

    requestRerender()

    return true
  }

  const requestPreviewSynchronization = async () => {
    const previewToken = window.sessionStorage.getItem('previewToken')
    // Fetch preview data from station
    await $fetch<PreviewResponse>('api/projects/preview/sync', {
      baseURL: apiURL,
      method: 'POST',
      params: {
        token: previewToken,
      },
    })
  }

  const mountPreviewUI = () => {
    const previewToken = window.sessionStorage.getItem('previewToken')
    // Show loading
    const el = document.createElement('div')
    el.id = '__nuxt_preview_wrapper'
    document.body.appendChild(el)
    createApp(ContentPreviewMode, {
      previewToken,
      apiURL,
      syncPreview,
      requestPreviewSyncAPI: requestPreviewSynchronization,
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

    // try finding content from contentPathMap
    if (!content) {
      content = contentPathMap[path || '/']
    }

    return content as ParsedContent
  }

  const updateContent = (content: PreviewFile) => {
    const previewToken = window.sessionStorage.getItem('previewToken')
    if (!storage.value) return

    contentPathMap[content.parsed!._path!] = content.parsed!
    storage.value.setItem(`${previewToken}:${content.parsed?._id}`, JSON.stringify(content.parsed))
  }

  const removeContentWithId = async (path: string) => {
    const previewToken = window.sessionStorage.getItem('previewToken')
    const content = await findContentWithId(path)
    await storage.value?.removeItem(`${previewToken}:${path}`)

    if (content) {
      // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
      delete contentPathMap[content._path!]
      const nonDraftContent = await findContentWithId(content._id)
      if (nonDraftContent) {
        contentPathMap[nonDraftContent._path!] = nonDraftContent
      }
    }
  }

  const requestRerender = async () => {
    if (contentConfig?.documentDriven) {
      // @ts-expect-error Update all cached pages
      const { pages } = callWithNuxt(nuxtApp, useContentState)

      const contents = await Promise.all(Object.keys(pages.value).map(async (key) => {
        return await findContentWithId(pages.value[key]?._id ?? key)
      }))

      pages.value = contents.reduce((acc, item, index) => {
        if (item) {
          acc[Object.keys(pages.value)[index]] = item
        }
        return acc
      }, {} as Record<string, ParsedContent>)
    }
    // Directly call `app:data:refresh` hook to refresh all data (!Calling `refreshNuxtData` causing some delay in data refresh!)
    await nuxtApp.hooks.callHookParallel('app:data:refresh')
  }

  return {
    apiURL,
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
    initiateIframeCommunication,
  }

  function initiateIframeCommunication() {
    // Not in an iframe
    if (!window.parent || window.self === window.parent) {
      return
    }
    const router = useRouter()
    const route = useRoute()

    const editorSelectedPath = ref('')

    // Evaluate route payload
    const routePayload = (route: RouteLocationNormalized) => ({
      path: route.path,
      query: toRaw(route.query),
      params: toRaw(route.params),
      fullPath: route.fullPath,
      meta: toRaw(route.meta),
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
            altKey: e.altKey,
          },
        }, '*')
      }
    })

    window.addEventListener('message', async (e) => {
      // IFRAME_MESSAGING_ALLOWED_ORIGINS format must be a comma separated string of allowed origins
      const allowedOrigins = studioConfig?.iframeMessagingAllowedOrigins?.split(',').map((origin: string) => origin.trim()) || []
      if (!['https://nuxt.studio', 'https://new.nuxt.studio', 'https://new.dev.nuxt.studio', 'https://dev.nuxt.studio', 'http://localhost:3000', ...allowedOrigins].includes(e.origin)) {
        return
      }

      const { type, payload = {} } = e.data || {}

      switch (type) {
        case 'nuxt-studio:editor:file-selected': {
          const content = await findContentWithId(payload.path)
          if (!content) {
          // DO not navigate to another page if content is not found
          // This makes sure that user stays on the same page when navigation through directories in the editor
          }
          else if (content._partial) {
          // Partials should use as helpers for other content files, like `_dir.yml`
          // We should not navigate if content is a partial
          }
          else if (content._path !== useRoute().path) {
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

          const appConfig = additions.find(item => item.path === StudioConfigFiles.appConfig)
          if (appConfig) {
            syncPreviewAppConfig(appConfig?.parsed)
          }
          const shouldRemoveAppConfig = deletions.find(item => item.path === StudioConfigFiles.appConfig)
          if (shouldRemoveAppConfig) {
            syncPreviewAppConfig(undefined)
          }

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

    nuxtApp.hook('page:finish', () => {
      detectRenderedContents()

      if (nuxtApp.payload.prerenderedAt) {
        requestRerender()
      }
    })

    // @ts-expect-error custom hook
    nuxtApp.hook('content:document-driven:finish', ({ route, page }) => {
      route.meta.studio_page_contentId = page?._id
    })

    // @ts-expect-error custom hook
    nuxtApp.hook('nuxt-studio:preview:ready', () => {
      window.parent.postMessage({
        type: 'nuxt-studio:preview:ready',
        payload: routePayload(useRoute()),
      }, '*')

      setTimeout(() => {
        // Initial sync
        detectRenderedContents()
      }, 100)
    })

    // Inject Utils to window
    function detectRenderedContents() {
      const renderedContents = Array.from(window.document.querySelectorAll('[data-content-id]'))
        .map(el => el.getAttribute('data-content-id')!)

      const contentIds = Array
        .from(new Set([route.meta.studio_page_contentId as string, ...renderedContents]))
        .filter(Boolean)

      if (editorSelectedPath.value === contentIds[0]) {
        editorSelectedPath.value = ''
        return
      }

      window.openContentInStudioEditor(contentIds, { navigate: true, pageContentId: route.meta.studio_page_contentId as string })
    }

    window.openContentInStudioEditor = (contentIds: string[], data = {}) => {
      window.parent.postMessage({
        type: 'nuxt-studio:preview:navigate',
        payload: {
          ...routePayload(route),
          contentIds,
          ...data,
        },
      }, '*')
    }
  }
}
