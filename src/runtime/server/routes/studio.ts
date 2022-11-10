import { version } from '../../../../package.json'
// @ts-ignore
import components from '#nuxt-component-meta/nitro'

export default eventHandler(() => {
  const filteredComponents = Object.values(components)
    .filter(c => c.global)
    .filter(c => !c.pascalName.startsWith('Content'))
    .filter(c => !c.pascalName.startsWith('DocumentDriven'))
    .filter(c => !c.pascalName.startsWith('Markdown'))
    .filter(c => !c.pascalName.startsWith('Prose'))
    .map(({ pascalName, filePath, meta }) => {
      return {
        name: pascalName,
        path: filePath,
        meta
      }
    })

  const { sources, ignores, locales, highlight, navigation, documentDriven, experiment } = useRuntimeConfig().content
  return {
    version,
    content: { sources, ignores, locales, highlight, navigation, documentDriven, experiment },
    components: filteredComponents
  }
})
