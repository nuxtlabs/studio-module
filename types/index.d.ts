export * from './communication'
export * from './file'
export * from './api'

declare global {
  interface Window {
    openContentInStudioEditor: (ids: string[], navigate?: { navigate?: boolean }) => void
  }
}