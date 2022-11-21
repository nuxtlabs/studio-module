import { defineNuxtPlugin, useRouter } from '#imports'
import { NuxtStudioClient, NuxtStudioEditor } from '~/../types'

export default defineNuxtPlugin(() => {
  // Not in an iframe
  if (!window.parent || window.self === window.parent) {
    return
  }
  const router = useRouter()

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

  router?.afterEach((to: any, from) => {
    window.parent.postMessage({
      type: 'nuxt-studio:preview:route-changed',
      payload: {
        path: to.path,
        query: to.query,
        params: to.params,
        fullPath: to.fullPath
      }
    }, '*')
  })

  let editor: NuxtStudioEditor | undefined

  const client: NuxtStudioClient = {
    updateEditor (_editor) {
      editor = _editor
    },
    onRouteChanged (route) {
      router.push(route)
    }
  }

  window.__NUXT_STUDIO__ = client
})
