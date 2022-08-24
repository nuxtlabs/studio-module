import { defineEventHandler, createError } from 'h3'
import { contentSource } from '#studio/server/utils'

export default defineEventHandler(async (event) => {
  const { id } = event.context.params

  if (!(await contentSource.hasItem(id))) {
    throw createError({ statusCode: 404, message: 'Document not found' })
  }
  const parsed = await $fetch(`/api/_content/query?_file=${id}`)
  const source: any = await contentSource.getItem(id)
  const parts = source.split(/---\n/)
  const content: any = parts.length >= 2 ? parts[2] : source

  return { id, ...parsed[0], content, source }
})
