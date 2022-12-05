import type { ComponentMeta } from 'vue-component-meta'
import { eventHandler } from 'h3'
import { version } from '../../../../package.json'
import { useRuntimeConfig } from '#imports'
// @ts-ignore
import components from '#nuxt-component-meta/nitro'

interface NuxtComponentMeta {
  pascalName: string
  filePath: string
  meta: ComponentMeta
  global: boolean
}

export default eventHandler(() => {
  const filteredComponents = (Object.values(components) as NuxtComponentMeta[])
    .filter(c => c.global)
    .filter(c => !c.pascalName.startsWith('Content'))
    .filter(c => !c.pascalName.startsWith('DocumentDriven'))
    .filter(c => !c.pascalName.startsWith('Markdown'))
    .filter(c => !c.pascalName.startsWith('Prose'))
    .map(({ pascalName, filePath, meta }) => {
      return {
        name: pascalName,
        path: filePath,
        meta: {
          props: meta.props,
          slots: meta.slots,
          events: meta.events
        }
      }
    })

  const { appConfigSchema, content: { sources, ignores, locales, highlight, navigation, documentDriven, experiment } } = useRuntimeConfig()
  return {
    version,
    appConfigSchema: appConfigSchema || {},
    content: { sources, ignores, locales, highlight, navigation, documentDriven, experiment },
    components: filteredComponents
  }
})
