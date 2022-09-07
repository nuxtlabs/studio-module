import { createBirpc } from 'birpc'
import { defineNuxtPlugin, useRouter } from '#imports'
import { IframeClientFunctions, StudioFunctions } from '~/../types'

export default defineNuxtPlugin(() => {
  // Not in an iframe
  if (!window.parent || window.self === window.parent) {
    return
  }

  const router = useRouter()
  const trustedOrigins = ['http://localhost:3100']

  const rpc = createBirpc<StudioFunctions, IframeClientFunctions>(
    // rpc functions to be called by studio
    {
      onRouteChanged (route) {
        router.push(route)
      }
    },
    // messaging options
    {
      on (fn) {
        window.addEventListener('message', (e) => {
          if (trustedOrigins.includes(e.origin) && e.data?.__nuxtStudio) {
            fn(e.data.data)
          }
        }, false)
      },
      post (data) {
        window.parent.postMessage({ __nuxtStudio: true, data }, '*')
      }
    }
  )

  router?.afterEach((to: any) => {
    rpc.onRouteChanged(to.path)
  })
})
