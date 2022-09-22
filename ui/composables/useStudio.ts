import { NuxtStudioClient, File } from '~/../types'

export interface StudioState {
  currentView: string,
  currentFile?: File
  previewPath: string
  previewClient?: NuxtStudioClient | null
  // TODO:
  tree?: any[]
  components?: any[]
}

export const useStudio = () => {
  return useState<StudioState>('studio', () => ({
    currentView: process.dev ? 'Home' : 'Login',
    previewClient: null,
    previewPath: String(useRoute().query.path || '/'),
    currentFile: undefined
  }))
}

export const setStudioView = (view: string) => {
  useStudio().value.currentView = view
}

export const quitStudio = () => {
  window.location.href = useStudio().value.previewPath
}
