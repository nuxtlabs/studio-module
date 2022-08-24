import { defineEventHandler, useBody } from 'h3'
import { parseFrontMatter } from 'remark-mdc'
import { contentSource } from '#studio/server/utils'

export default defineEventHandler(async (event) => {
  const { id } = event.context.params
  const { content = '' } = await useBody<{ content: string }>(event)

  const source = await contentSource.setItem(id, content)
  let parsed
  try {
    parsed = await parseFrontMatter(content)
  } catch (_) {
    parsed = { content, data: {} }
  }

  return {
    id,
    ...parsed,
    source
  }
})
