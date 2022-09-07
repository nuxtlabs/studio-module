import { defineNuxtPlugin, useRouter } from '#imports'
import { IframePayload } from '~/../types'

export default defineNuxtPlugin(() => {
  const router = useRouter()
  const trustedOrigins = ['http://localhost:3100']

  // Receive an order to change the page
  window.addEventListener('message', (e) => {
    if (!trustedOrigins.includes(e.origin)) {
      return
    }

    if (!e.data?.nuxtStudio) { return }

    if (e.data.type === 'router') {
      const path = e.data.path

      try {
        const resolvedRoute = router.resolve(path)
        if (resolvedRoute) {
          router.push(path)
        }
      } catch (e) {}
    }
  }, false)

  // Ensure window have a parent
  const { page } = useContent()
  if (window.self !== window.parent) {
    // Send message to parent about page changes

    function postMessage (msg: IframePayload) {
      window.parent.postMessage(msg, '*')
    }

    router?.afterEach((to: any) => {
      console.log('currentPage', page.value._file)
      postMessage({ nuxtStudio: true, type: 'router', path: to.path })
    })
  }
})
