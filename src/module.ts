import { existsSync } from 'node:fs'
import path from 'path'
import { defu } from 'defu'
import { addPrerenderRoutes, installModule, defineNuxtModule, addPlugin, extendViteConfig, createResolver, logger, addComponentsDir, addServerHandler, resolveAlias, addVitePlugin } from '@nuxt/kit'
import { findNearestFile } from 'pkg-types'
// @ts-ignore
import gitUrlParse from 'git-url-parse'

const log = logger.withTag('@nuxt/studio')

export interface ModuleOptions {
  /**
   * Enable Studio mode
   * @default: 'production'
   **/
  enabled: 'production' | true
  /**
   * Studio project(s) to link
   *
   * If you have multiple projects, you can use an array of strings.
   *
   * @example 'team-slug/project-slug'
   * or
   * @example ['team-slug/project-slug', 'team-slug/project-slug-2']
   * @default: ''
   **/
  project: string | string[]
}

export interface ModuleHooks {}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'studio',
    configKey: 'studio'
  },
  defaults: {
    enabled: 'production',
    project: ''
  },
  async setup (options, nuxt) {
    // @ts-ignore
    nuxt.hook('schema:resolved', (schema: any) => {
      nuxt.options.runtimeConfig.appConfigSchema = {
        properties: schema.properties?.appConfig,
        default: schema.default?.appConfig
      }
      nuxt.options.runtimeConfig.contentSchema = schema.properties?.content || {}
    })

    // Support custom ~/.studio/app.config.json
    nuxt.hook('app:resolve', (appCtx) => {
      const studioAppConfigPath = resolveAlias('~/.studio/app.config.json')
      if (existsSync(studioAppConfigPath)) {
        appCtx.configs.unshift(studioAppConfigPath)
      }
    })

    // Only enable Studio in production build
    if (options.enabled === 'production' && nuxt.options.dev === true) {
      return
    }

    const contentModule = '@nuxt/content'
    // Check Content module is installed
    if (
      !nuxt.options.runtimeConfig.content &&
      !nuxt.options.modules.includes(contentModule)
    ) {
      log.warn('Could not find `@nuxt/content` module. Please install it to enable preview mode.')
      return
    }
    // Check Content module version
    const contentModuleVersion = await import(contentModule)
      .then(m => m.default || m)
      .then((m: any) => m.getMeta())
      .then(m => m.version)
      .catch(() => '0')
    if (contentModuleVersion < '2.1.1') {
      log.warn('Please update `@nuxt/content` to version 2.1.1 or higher to enable preview mode.')
      return
    }

    // Check Pinceau module activated
    // @ts-ignore
    nuxt.hook('pinceau:options', (options) => {
      options.studio = true
    })

    const { resolve } = createResolver(import.meta.url)

    const apiURL = process.env.NUXT_PUBLIC_STUDIO_API_URL || process.env.STUDIO_API || 'https://api.nuxt.studio'
    const publicToken = process.env.NUXT_PUBLIC_STUDIO_TOKENS
    const iframeMessagingAllowedOrigins = process.env.IFRAME_MESSAGING_ALLOWED_ORIGINS
    const gitInfo = await _getLocalGitInfo(nuxt.options.rootDir) || _getGitEnv() || {}
    nuxt.options.runtimeConfig.studio = defu(nuxt.options.runtimeConfig.studio as any, {
      publicToken,
      project: options.project,
      gitInfo
    })
    nuxt.options.runtimeConfig.public.studio = defu(nuxt.options.runtimeConfig.public.studio as any, { apiURL, iframeMessagingAllowedOrigins })

    extendViteConfig((config) => {
      config.optimizeDeps = config.optimizeDeps || {}
      config.optimizeDeps.include = config.optimizeDeps.include || []
      config.optimizeDeps.include.push(
        'socket.io-client', 'slugify'
      )
    })

    if (contentModuleVersion === '2.10.0') {
      addVitePlugin({
        name: 'content-resolver',
        enforce: 'pre',
        resolveId (id, importer) {
          if (id.endsWith('.mjs') && ((importer || '').includes('@nuxt/content/dist') || id.includes('@nuxt/content/dist'))) {
            id = id
              .replace('.mjs', '.js')
              .replace(/^\/node_modules/, './node_modules/')

            return path.resolve(path.dirname(importer || __dirname), id.replace('.mjs', '.js'))
          }
        }
      })
    }

    // Add plugins
    addPlugin(resolve('./runtime/plugins/preview.client'))

    // Register components
    addComponentsDir({ path: resolve('./runtime/components') })

    // Add server route to know Studio is enabled
    addServerHandler({
      method: 'get',
      route: '/__studio.json',
      handler: resolve('./runtime/server/routes/studio')
    })
    addPrerenderRoutes('/__studio.json')

    // Install dependencies
    await installModule('nuxt-component-meta', {
      globalsOnly: true
    })
  }
})

// --- Utilities to get git info ---

interface GitInfo {
  // Repository name
  name: string,
  // Repository owner/organization
  owner: string,
  // Repository URL
  url: string,
}

async function _getLocalGitInfo (rootDir: string): Promise<GitInfo | void> {
  const remote = await _getLocalGitRemote(rootDir)
  if (!remote) {
    return
  }

  // https://www.npmjs.com/package/git-url-parse#clipboard-example
  const { name, owner, source } = gitUrlParse(remote) as Record<string, string>
  const url = `https://${source}/${owner}/${name}`

  return {
    name,
    owner,
    url
  }
}

async function _getLocalGitRemote (dir: string) {
  try {
    // https://www.npmjs.com/package/parse-git-config#options
    const parseGitConfig = await import('parse-git-config' as string).then(
      m => m.promise || m.default || m
    ) as (opts: { path: string }) => Promise<Record<string, Record<string, string>>>
    const gitDir = await findNearestFile('.git/config', { startingFrom: dir })
    const parsed = await parseGitConfig({ path: gitDir })
    if (!parsed) {
      return
    }
    const gitRemote = parsed['remote "origin"'].url
    return gitRemote
  } catch (err) {

  }
}

function _getGitEnv (): GitInfo {
  // https://github.com/unjs/std-env/issues/59
  const envInfo = {
    // Provider
    provider: process.env.VERCEL_GIT_PROVIDER || // vercel
     (process.env.GITHUB_SERVER_URL ? 'github' : undefined) || // github
     '',
    // Owner
    owner: process.env.VERCEL_GIT_REPO_OWNER || // vercel
      process.env.GITHUB_REPOSITORY_OWNER || // github
      process.env.CI_PROJECT_PATH?.split('/').shift() || // gitlab
      '',
    // Name
    name: process.env.VERCEL_GIT_REPO_SLUG ||
     process.env.GITHUB_REPOSITORY?.split('/').pop() || // github
     process.env.CI_PROJECT_PATH?.split('/').splice(1).join('/') || // gitlab
     '',
    // Url
    url: process.env.REPOSITORY_URL || '' // netlify
  }

  if (!envInfo.url && envInfo.provider && envInfo.owner && envInfo.name) {
    envInfo.url = `https://${envInfo.provider}.com/${envInfo.owner}/${envInfo.name}`
  }

  // If only url available (ex: Netlify)
  if (!envInfo.name && !envInfo.owner && envInfo.url) {
    try {
      const { name, owner } = gitUrlParse(envInfo.url) as Record<string, string>
      envInfo.name = name
      envInfo.owner = owner
    } catch {}
  }

  return {
    name: envInfo.name,
    owner: envInfo.owner,
    url: envInfo.url
  }
}
