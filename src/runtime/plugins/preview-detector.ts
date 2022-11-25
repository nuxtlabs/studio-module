import { createApp, ref } from 'vue'
import type { Storage } from 'unstorage'
import { defineNuxtPlugin, useRuntimeConfig, useRoute, useCookie, refreshNuxtData, useNuxtApp } from '#imports'
import { ContentPreviewMode } from '#components'
import { DraftFile, PreviewResponse, PreviewFile } from '~~/../types'

export default defineNuxtPlugin((nuxtApp) => {
  const { studio } = useRuntimeConfig().public
  let contentStorage: Storage

  function initializePreview () {
    const nuxtApp = useNuxtApp()
    const query = useRoute().query || {}
    const previewToken = useCookie('previewToken', { sameSite: 'none', secure: true })

    // Disable preview mode if token value is null, undefined or empty
    if (Object.prototype.hasOwnProperty.call(query, 'preview') && !query.preview) {
      return
    }

    if (!query.preview && !previewToken.value) {
      return
    }

    // This is required to enable client-db initialization inside Content Module
    // In the intialization process of client-db, it will call
    // `content:storage` hook to get the storage instance
    nuxtApp.hook('page:finish', () => {
      // Refresh nuxt data
      refreshNuxtData()
    })

    if (query.preview && previewToken.value !== query.preview) {
      previewToken.value = String(query.preview)
    }

    // Show loading
    const storageReady = ref(false)
    const el = document.createElement('div')
    el.id = '__nuxt_preview_wrapper'
    document.body.appendChild(el)
    createApp(ContentPreviewMode, {
      previewToken,
      apiURL: studio.apiURL,
      storageReady,
      refresh: () => fetchData(contentStorage, { baseURL: studio.apiURL, token: previewToken.value })
        .then(() => refreshNuxtData()),
      init: () => syncData(studio.apiURL, previewToken.value)
    }).mount(el)

    // @ts-ignore
    nuxtApp.hook('content:storage', (storage: Storage) => {
      contentStorage = storage
      storageReady.value = true
    })
  }

  if (studio?.apiURL) {
    nuxtApp.hook('app:mounted', async () => {
      await initializePreview()
    })
  }
})

async function fetchData (contentStorage: Storage, { token, baseURL }: { token: string, baseURL: string }) {
  // Fetch preview data from station
  const data = await $fetch<PreviewResponse>('api/projects/preview', {
    baseURL,
    params: {
      token
    }
  }) as any

  // Remove previous preview data
  const keys = await contentStorage.getKeys(`${token}:`)
  await Promise.all(keys.map(key => contentStorage.removeItem(key)))

  // Set preview meta
  await contentStorage.setItem(
    `${token}$`,
    JSON.stringify({
      ignoreBuiltContents: (data.files || []).length !== 0
    })
  )

  // Fill store with preview content
  const items = mergeDraft(data.files, data.additions, data.deletions)

  await Promise.all(
    items.map(item => contentStorage.setItem(`${token}:${item.parsed?._id}`, JSON.stringify(item.parsed)))
  )
}

async function syncData (baseURL: string, token: string) {
  // Fetch preview data from station
  await $fetch<PreviewResponse>('api/projects/preview/sync', {
    baseURL,
    method: 'POST',
    params: {
      token
    }
  }) as any
}

const mergeDraft = (dbFiles: PreviewFile[], draftAdditions: DraftFile[], draftDeletions: DraftFile[]) => {
  const additions = [...(draftAdditions || [])]
  const deletions = [...(draftDeletions || [])]

  // Compute file name
  const mergedFiles: PreviewFile[] = [...(dbFiles || [])]

  // Merge darft additions
  for (const addition of additions) {
    // File has been renamed
    if (addition.oldPath) {
      // Remove old file from deletions (only display renamed one)
      deletions.splice(deletions.findIndex(d => d.path === addition.oldPath), 1)

      // Custom case of #447
      const oldPathExistInCache = additions.find(a => a.path === addition.oldPath)
      if (oldPathExistInCache) {
        mergedFiles.push({ path: addition.path, parsed: addition.parsed })
        // Update exsiting renamed file data
      } else {
        const file = mergedFiles.find(f => f.path === addition.oldPath)
        if (file) {
          file.path = addition.path

          // If file is also modified, set draft content
          if (addition.parsed) {
            file.parsed = addition.parsed
          } else if (addition.pathMeta) {
            // Apply new path metadata
            ['_file', '_path', '_id', '_locale'].forEach((key) => {
              file.parsed![key] = addition.pathMeta![key]
            })
          }
        }
      }
      // File has been added
    } else if (addition.new) {
      mergedFiles.push({ path: addition.path, parsed: addition.parsed })
      // File has been modified
    } else {
      const file = mergedFiles.find(f => f.path === addition.path)
      if (file) {
        Object.assign(file, { path: addition.path, parsed: addition.parsed })
      }
    }
  }

  // Merge draft deletions (set deletion status)
  for (const deletion of deletions) {
    // File has been deleted
    mergedFiles.splice(mergedFiles.findIndex(f => f.path === deletion.path), 1)
  }
  return mergedFiles
}
