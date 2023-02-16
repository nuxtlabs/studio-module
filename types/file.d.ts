export interface File {
  id: string
  path: string
  name: string
  type: 'file' | 'directory'
  status: 'deleted'
  children?: File[]
  content?: string
  source?: string
  image?: string
  title?: string
  description?: string
  // TODO:
}
