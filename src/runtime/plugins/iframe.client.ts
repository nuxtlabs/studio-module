import { defineNuxtPlugin, useRouter } from '#imports'
import { IframePayload } from '~/../types'

const trustedOrigins = [
  'http://localhost:3000',
  'https://dev-studio.nuxt.com',
  'https://studio.nuxt.com'
]

export default defineNuxtPlugin(() => {
  const router = useRouter()

  window.addEventListener('message', (e) => {
    if (!trustedOrigins.includes(e.origin)) {
      return
    }
    if (e.origin === window.location.origin) {
      return
    }

    if (typeof e.data !== 'string') { return }
    const [action, ...args] = e.data.split(':')

    if (action === 'push') {
      const path = args[0]

      try {
        const resolvedRoute = router.resolve(path)
        if (resolvedRoute) {
          router.push(path)
        }
      } catch (e) {}
    }
  }, false)

  // Not inside an iframe
  if (!window.parent || window.self === window.parent) {
    return
  }

  function postMessage (payload: IframePayload) {
    window.parent.postMessage(JSON.stringify(payload), '*')
  }

  router.afterEach((to) => {
    postMessage({
      type: 'push',
      url: location.origin + to.fullPath,
      route: to
    })
  })
})
