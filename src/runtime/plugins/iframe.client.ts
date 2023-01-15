import type { NuxtApp } from 'nuxt/app'
import { defineNuxtPlugin, ref, toRaw, useRoute, useRouter } from '#imports'

export default defineNuxtPlugin(async (nuxtApp: NuxtApp) => {
  // Not in an iframe
  if (!window.parent || window.self === window.parent) {
    return
  }
  const router = useRouter()

  const editorSelectedPath = ref('')
  const isDocumentDrivenInitialHook = ref(true)

  const useStudio = await import('../composables/useStudio').then(m => m.useStudio)
  const { findContentWithId } = useStudio()

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
        path: route.path,
        query: toRaw(route.query),
        params: toRaw(route.params),
        fullPath: route.fullPath,
        meta: toRaw(route.meta),
        contentId: page?._id
      }
    }, '*')
  })

  router?.afterEach((to: any) => {
    window.parent.postMessage({
      type: 'nuxt-studio:preview:route-changed',
      payload: {
        path: to.path,
        query: toRaw(to.query),
        params: toRaw(to.params),
        fullPath: to.fullPath,
        meta: toRaw(to.meta)
      }
    }, '*')
  })

  // @ts-ignore
  nuxtApp.hook('nuxt-studio:preview:ready', () => {
    const route = useRoute()

    window.parent.postMessage({
      type: 'nuxt-studio:preview:ready',
      payload: {
        path: route.path,
        query: toRaw(route.query),
        params: toRaw(route.params),
        fullPath: route.fullPath,
        meta: toRaw(route.meta)
      }
    }, '*')
  })
})
