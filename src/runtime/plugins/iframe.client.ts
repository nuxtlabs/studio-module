import { defineNuxtPlugin, useRouter } from '#imports'

export default defineNuxtPlugin(() => {
  const router = useRouter()
  const trustedOrigins = ['http://localhost:3100']

  // Receive an order to change the page
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

  // Ensure window have a parent
  if (window.self !== window.parent) {
    // Send message to parent about page changes
    router?.afterEach((to: any) => {
      window.parent?.postMessage({ nuxt_studio: true, type: 'router', path: to.path }, '*')
    })
  }
})
