/* eslint-disable no-use-before-define */
import { defineEventHandler } from 'h3'
import { useRuntimeConfig } from '#imports'
import { contentSource } from '#studio/server/utils'

interface TreeFile {
  type: 'file'
  id: string
  name: string
}

interface TreeFolder {
  type: 'folder'
  name: string
  items: TreeItem[]
}

type TreeItem = TreeFolder | TreeFile

export type Tree = TreeItem[]

function buildTree (ids: string[], root = ''): Tree {
  const tree: Tree = []

  if (!ids.length) {
    return []
  }

  for (let i = 0; i < ids.length;) {
    const id = ids[i]
    if (!id.includes(':')) {
      tree.push({
        type: 'file',
        id: root ? `${root}:${id}` : id,
        name: id
      })
      i += 1
    } else {
      const folderName = id.split(':')[0]
      const childIds = ids.slice(i)
        .filter(k => k.startsWith(`${folderName}:`))
        .map(k => k.slice(`${folderName}:`.length))
      const items = buildTree(childIds, root ? `${root}:${folderName}` : folderName)
      tree.push({
        type: 'folder',
        name: id.split(':')[0],
        items
      })
      i += childIds.length
    }
  }

  tree.sort((a, b) => a.name.localeCompare(b.name))
  tree.sort((a, b) => a.type === b.type ? 0 : a.type === 'file' ? 1 : -1)

  return tree
}

export default defineEventHandler(async () => {
  // Only supports @nuxt/content for now
  if (!useRuntimeConfig().content) {
    return
  }

  const ids: string[] = await contentSource.getKeys()
  const tree = buildTree(ids)

  return tree
})
