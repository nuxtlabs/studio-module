
import { defineEventHandler, appendHeader } from 'h3'
import { components } from '#meta/virtual/meta'

export default defineEventHandler((event) => {
  // TODO: Replace via downstream config
  appendHeader(event, 'Access-Control-Allow-Origin', '*')

  return components
    .filter(c => c.global)
    .filter(c => !c.name.startsWith('Content'))
    .filter(c => !c.name.startsWith('DocumentDriven'))
    .filter(c => !c.name.startsWith('Markdown'))
})
