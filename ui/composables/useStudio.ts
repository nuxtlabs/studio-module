export const useStudio = () => {
  return useState('studio', () => ({
    currentView: process.dev ? 'Home' : 'Login',
    previewClient: null,
    previewPath: String(useRoute().query.path || '/')
  }))
}

export const setStudioView = (view: string) => {
  useStudio().value.currentView = view
}

export const quitStudio = () => {
  window.location.href = useStudio().value.previewPath
}
