import { defineDriver } from 'unstorage'

export default defineDriver((options) => {
  const { baseURL } = options

  let memory = {}
  let preview = null

  return {
    async getKeys (prefix) {
      // Return empty array if is no prefix
      if (!prefix) {
        return []
      }

      const [token] = prefix.split(':')
      const draft = await $fetch('/api/projects/preview', {
        params: { token },
        baseURL
      }).catch(_err => null)

      if (!draft) {
        return []
      }
      if (preview?.mtime !== draft.mtime) {
        memory = {}
        preview = draft
        for (const addition of draft.additions) {
          const { path, oldPath, content } = addition
          const id = path.replace(/\//g, ':')

          // Mark old path as deleted
          if (oldPath) {
            memory[`${token}:${id}`] = { __deleted: true }
          }

          memory[`${token}:${id}`] = content
          memory[`${token}:${id}$`] = { mtime: new Date(draft.mtime).toISOString() }
        }
        for (const deletion of draft.deletions) {
          memory[`${token}:${deletion.pathid}`] = { __deleted: true }
        }
      }
      return Object.keys(memory).filter(key => !key.endsWith('$'))
    },
    hasItem (key) {
      return Promise.resolve(!!memory[key])
    },
    getItem (key) {
      return Promise.resolve(memory[key])
    },
    getMeta (key) {
      return Promise.resolve(memory[`${key}$`])
    }
  }
})
