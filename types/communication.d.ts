import { useNuxtApp } from '#app'

export interface NuxtStudioEditor {
  nuxt: ReturnType<typeof useNuxtApp>
  onRouteChanged(route: string): void
}

export interface NuxtStudioClient {
  onRouteChanged(route: string): void
  updateEditor(editor: NuxtStudioEditor): void
}

declare global {
  interface Window {
    __NUXT_STUDIO__: NuxtStudioClient | undefined
  }
}
