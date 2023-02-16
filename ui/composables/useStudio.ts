import { NuxtStudioClient, File } from '~~/../types'

export type StudioState = ReturnType<typeof createStudio>

function createStudio () {
  const { apiURL } = useRuntimeConfig().public.studio
  const { data: contentTree, refresh: refreshContentTree, then: getContentTree } = useFetch<any[]>('/files/content', { baseURL: apiURL })
  const { data: components, refresh: refreshComponents, then: getComponents } = useFetch<any[]>('/components', { baseURL: apiURL })

  const studio = reactive({
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
      window.location.href = studio.previewPath
    },

    setView (view: string) {
      studio.currentView = view
      if (view !== 'Content') {
        studio.currentFile = undefined
      }
    },

    async selectFile (id: string) {
      if (studio.currentFile?.id === id) {
        return
      }
      studio.currentFile = {
        ...studio.contentTree.find(i => i.id === id),
        ...await $fetch<any>(`/files/${id}`, { baseURL: studio.apiURL })
      }
      // state.previewPath = '/' + state.currentFile.path
    }
  })

  if (process.dev) {
    // eslint-disable-next-line no-console
    console.log('Nuxt Studio', studio)
  }

  return studio
}

export const useStudio = () => {
  return useState<StudioState>('studio', createStudio)
}
