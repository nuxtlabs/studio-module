import { NuxtStudioClient, File } from '~/../types'

export type StudioState = ReturnType<typeof createStudio>

function createStudio () {
  const { apiURL } = useRuntimeConfig().public.studio
  const { data: contentTree, refresh: refreshContentTree, then: getContentTree } = useFetch<any[]>('/files/content', { baseURL: apiURL })
  const { data: components, refresh: refreshComponents, then: getComponents } = useFetch<any[]>('/components', { baseURL: apiURL })

  const state = reactive({
    apiURL,

    contentTree,
    refreshContentTree,
    getContentTree: () => getContentTree().then(r => r.data.value),

    components,
    refreshComponents,
    getComponents: () => getComponents().then(r => r.data.value),

    currentView: process.dev ? 'Home' : 'Login',
    previewClient: undefined as NuxtStudioClient | undefined,
    previewPath: String(useRoute().query.path || '/'),
    currentFile: undefined as File | undefined,

    quit () {
      window.location.href = state.previewPath
    },

    setView (view: string) {
      state.currentView = view
      if (view !== 'Content') {
        state.currentFile = undefined
      }
    }
  })

  return state
}

export const useStudio = () => {
  return useState<StudioState>('studio', createStudio)
}
