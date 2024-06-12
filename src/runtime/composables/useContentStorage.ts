import type { ParsedContent } from '@nuxt/content/types'
import type { PreviewFile } from '../types'
import { useNuxtApp, useState, queryContent } from '#imports'

export const useContentStorage = () => {
  const nuxtApp = useNuxtApp()
  const contentPathMap = {} as Record<string, ParsedContent>
  const storage = useState<Storage | null>('studio-client-db', () => null)

  // Initialize storage
  if (!storage.value) {
    nuxtApp.hook('content:storage', (_storage: Storage) => {
      storage.value = _storage
    })

    // Call `queryContent` to trigger `content:storage` hook
    queryContent('/non-existing-path').findOne()
  }

  const findContentItem = async (path: string): Promise<ParsedContent | null> => {
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

  const updateContentItem = (previewToken: string, file: PreviewFile) => {
    if (!storage.value) return

    contentPathMap[file.parsed!._path!] = file.parsed!
    storage.value.setItem(`${previewToken}:${file.parsed?._id}`, JSON.stringify(file.parsed))
  }

  const removeContentItem = async (previewToken: string, path: string) => {
    const content = await findContentItem(path)
    await storage.value?.removeItem(`${previewToken}:${path}`)

    if (content) {
    // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
      delete contentPathMap[content._path!]
      const nonDraftContent = await findContentItem(content._id)
      if (nonDraftContent) {
        contentPathMap[nonDraftContent._path!] = nonDraftContent
      }
    }
  }

  const removeAllContentItems = async (previewToken: string) => {
    const keys: string[] = await storage.value.getKeys(`${previewToken}:`)
    await Promise.all(keys.map(key => storage.value.removeItem(key)))
  }

  const setPreviewMetaItems = async (previewToken: string, files: PreviewFile[]) => {
    const sources = new Set<string>(files.map(file => file.parsed!._id.split(':').shift()!))
    await storage.value.setItem(`${previewToken}$`, JSON.stringify({ ignoreSources: Array.from(sources) }))
  }

  return {
    storage,
    findContentItem,
    updateContentItem,
    removeContentItem,
    removeAllContentItems,
    setPreviewMetaItems,
  }
}
