import { createApp } from 'vue'
import type { ParsedContent } from '@nuxt/content/dist/runtime/types'
import type { RouteLocationNormalized } from 'vue-router'
import type { AppConfig } from 'nuxt/schema'
import ContentPreviewMode from '../components/ContentPreviewMode.vue'
import { createSingleton, deepAssign, deepDelete, defu, mergeDraft, StudioConfigFiles } from '../utils'
import type { PreviewFile, PreviewResponse, FileChangeMessagePayload } from '../types'
import { useContentStorage } from './useContentStorage'
import { callWithNuxt } from '#app'
import { useAppConfig, useNuxtApp, useRuntimeConfig, useContentState, ref, toRaw, useRoute, useRouter } from '#imports'

const useDefaultAppConfig = createSingleton(() => JSON.parse(JSON.stringify((useAppConfig()))))

let dbFiles: PreviewFile[] = []

export const useStudio = () => {
  const nuxtApp = useNuxtApp()
  const { storage, findContentItem, updateContentItem, removeContentItem, removeAllContentItems, setPreviewMetaItems } = useContentStorage()
  const { studio: studioConfig, content: contentConfig } = useRuntimeConfig().public
  const apiURL = window.sessionStorage.getItem('previewAPI') || studioConfig?.apiURL

  // App config (required)
  const initialAppConfig = useDefaultAppConfig()

  const syncPreviewFiles = async (files: PreviewFile[]) => {
    const previewToken = window.sessionStorage.getItem('previewToken') as string

    // Remove previous preview data
    removeAllContentItems(previewToken)

    // Set preview meta
    setPreviewMetaItems(previewToken, files)

    // Handle content files
    await Promise.all(
      files.map((file) => {
        updateContentItem(previewToken, file)
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

  const syncPreview = async (data: PreviewResponse) => {
    // Preserve db files in case storage is not ready yet (see check below)
    dbFiles = data.files = data.files || dbFiles || []

    if (!storage.value) {
      // Postpone sync if storage is not ready
      return false
    }

    // Empty dbFiles array once storage is ready to clear memory
    dbFiles = []

    const mergedFiles = mergeDraft(data.files, data.additions, data.deletions)

    // Handle content files
    const contentFiles = mergedFiles.filter(item => !([StudioConfigFiles.appConfig, StudioConfigFiles.nuxtConfig].includes(item.path)))
    await syncPreviewFiles(contentFiles)

    const appConfig = mergedFiles.find(item => item.path === StudioConfigFiles.appConfig)
    syncPreviewAppConfig(appConfig?.parsed as ParsedContent)

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

  const requestRerender = async () => {
    if (contentConfig?.documentDriven) {
      const { pages } = callWithNuxt(nuxtApp, useContentState)

      const contents = await Promise.all(Object.keys(pages.value).map(async (key) => {
        return await findContentItem(pages.value[key]?._id ?? key)
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
          const content = await findContentItem(payload.path)
          if (!content) {
            // Do not navigate to another page if content is not found
            // This makes sure that user stays on the same page when navigation through directories in the editor
          }
          else if (content._partial || !String(payload.path).endsWith('.md')) {
            // Partials and non-markdown files should use as helpers for other content files, like `_dir.yml`
            // We should not navigate if content is a partial or non-markdown file
          }
          else if (content._path !== useRoute().path) {
            editorSelectedPath.value = content._path!
            router.push(content._path!)
          }
          break
        }
        case 'nuxt-studio:editor:media-changed':
        case 'nuxt-studio:editor:file-changed': {
          const previewToken = window.sessionStorage.getItem('previewToken') as string
          const { additions = [], deletions = [] } = payload as FileChangeMessagePayload
          for (const addition of additions) {
            await updateContentItem(previewToken, addition)
          }
          for (const deletion of deletions) {
            await removeContentItem(previewToken, deletion.path)
          }
          requestRerender()
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
