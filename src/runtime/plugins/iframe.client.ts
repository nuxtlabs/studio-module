import { defineNuxtPlugin, useRouter } from '#imports'
import { NuxtStudioClient, NuxtStudioEditor } from '~/../types'

export default defineNuxtPlugin(() => {
  // Not in an iframe
  if (!window.parent || window.self === window.parent) {
    return
  }

  const router = useRouter()
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

  router?.afterEach((to: any) => {
    editor?.onRouteChanged(to.path)
  })
})
