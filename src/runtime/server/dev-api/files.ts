import { resolve } from 'path'
import fsp from 'fs/promises'
import anymatch from 'anymatch'
import { eventHandler, isMethod, readBody } from 'h3'
import { withoutLeadingSlash, withoutTrailingSlash } from 'ufo'

interface FilesHandlerOptions {
  rootDir: string
}

export default (option: FilesHandlerOptions) => eventHandler(async (event) => {
  const path = event.node.req.url
  const { rootDir } = option
  const filePath = withoutTrailingSlash(rootDir + path)

  if (isMethod(event, 'POST')) {
    const body = await readBody(event)
    await fsp.writeFile(filePath, body.source, 'utf-8')
    return {
      id: path
    }
  }

  if (isMethod(event, 'PUT')) {
    await fsp.writeFile(filePath, '', 'utf-8').catch(ignoreNotfound)
    return {
      id: path
    }
  }

  if (isMethod(event, 'DELETE')) {
    await fsp.unlink(filePath).catch(ignoreNotfound)
    return {
      id: path
    }
  }

  const stats = await fsp.stat(filePath).catch(ignoreNotfound)
  if (stats.isDirectory()) {
    const ignore = anymatch([
      '**/node_modules/**',
      '**/.git/**',
      '**/.nuxt/**'
    ])

    return readdirRecursive(filePath, ignore, {
      id: withoutLeadingSlash(path === '/' ? '' : path),
      children: []
    })
  }

  const source = await fsp.readFile(filePath, 'utf-8').catch(ignoreNotfound)
  return {
    id: path,
    source
  }
})

function ignoreNotfound (err: any) {
  return err.code === 'ENOENT' || err.code === 'EISDIR' ? null : err
}

function readdir (dir: string) {
  return fsp.readdir(dir, { withFileTypes: true }).catch(ignoreNotfound).then(r => r || [])
}

async function readdirRecursive (dir: string, ignore: any, parent: any = {}) {
  if (ignore && ignore(dir)) {
    return []
  }
  const entries = await readdir(dir)
  const files = parent?.children || []
  await Promise.all(entries.map(async (entry: any) => {
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
