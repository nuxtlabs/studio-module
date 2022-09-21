import { resolve } from 'path'
import fsp from 'fs/promises'
import anymatch from 'anymatch'
import { eventHandler, isMethod, readBody } from 'h3'
import { withoutLeadingSlash } from 'ufo'

interface FilesHandlerOptions {
  rootDir: string
}

export default (option: FilesHandlerOptions) => eventHandler(async (event) => {
  const path = withoutLeadingSlash(event.req.url)

  const { rootDir } = option

  if (isMethod(event, 'POST')) {
    const body = await readBody(event)
    await fsp.writeFile(resolve(rootDir, path), body.source, 'utf-8')
    return {
      id: path
    }
  }

  if (isMethod(event, 'PUT')) {
    await fsp.writeFile(resolve(rootDir, path), '', 'utf-8').catch(ignoreNotfound)
    return {
      id: path
    }
  }

  if (isMethod(event, 'DELETE')) {
    await fsp.unlink(resolve(rootDir, path)).catch(ignoreNotfound)
    return {
      id: path
    }
  }

  if (path === '/') {
    const ignore = anymatch([
      '**/node_modules/**',
      '**/.git/**',
      '**/.nuxt/**'
    ])

    return readdirRecursive(rootDir, ignore)
  }

  const source = await fsp.readFile(resolve(rootDir, path), 'utf-8').catch(ignoreNotfound)
  return {
    id: path,
    source
  }
})

function ignoreNotfound (err) {
  return err.code === 'ENOENT' || err.code === 'EISDIR' ? null : err
}

function readdir (dir) {
  return fsp.readdir(dir, { withFileTypes: true }).catch(ignoreNotfound).then(r => r || [])
}

async function readdirRecursive (dir, ignore, parent: any = {}) {
  if (ignore && ignore(dir)) {
    return []
  }
  const entries = await readdir(dir)
  const files = parent?.children || []
  await Promise.all(entries.map(async (entry) => {
    const entryPath = resolve(dir, entry.name)
    if (entry.isDirectory() && !ignore(entry.name)) {
      const dir = {
        name: entry.name,
        type: 'directory',
        id: parent.id ? `${parent.id}/${entry.name}` : entry.name,
        path: parent.id ? `${parent.id}/${entry.name}` : entry.name,
        children: []
      }
      files.push(dir)
      await readdirRecursive(entryPath, ignore, dir)
    } else if (ignore && !ignore(entry.name)) {
      files.push({
        name: entry.name,
        type: 'file',
        id: parent.id ? `${parent.id}/${entry.name}` : entry.name,
        path: parent.id ? `${parent.id}/${entry.name}` : entry.name
      })
    }
  }))
  return files
}
