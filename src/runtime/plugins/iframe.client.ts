import type { RouteLocationNormalized } from 'vue-router'
import { defineNuxtPlugin, ref, toRaw, useRoute, useRouter } from '#imports'

export default defineNuxtPlugin(async (nuxtApp) => {
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

  const useStudio = await import('../composables/useStudio').then(m => m.useStudio)
  const { contentStorage, findContentWithId, updateContent, removeContentWithId, requestRerender } = useStudio()

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
          editorSelectedPath.value = '/'
          router.push('/')
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
        const { additions = [], deletions = [] } = payload
        for (const addition of additions) {
          await updateContent(addition)
        }
        for (const deletion of deletions) {
          await removeContentWithId(deletion.path)
        }
        requestRerender()
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

  router?.afterEach((to: any) => {
    window.parent.postMessage({
      type: 'nuxt-studio:preview:route-changed',
      payload: routePayload(to)
    }, '*')
  })

  // @ts-ignore
  nuxtApp.hook('nuxt-studio:preview:ready', () => {
    window.parent.postMessage({
      type: 'nuxt-studio:preview:ready',
      payload: routePayload(useRoute())
    }, '*')
  })
})
