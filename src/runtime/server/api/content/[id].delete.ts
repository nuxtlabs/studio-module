import { defineEventHandler, createError } from 'h3'
import { contentSource } from '#studio/server/utils'

export default defineEventHandler(async (event) => {
  const { id } = event.context.params

  if (!(await contentSource.hasItem(id))) {
    throw createError({ statusCode: 404, message: 'Document not found' })
  }

  await contentSource.removeItem(id)

  return { delete: true }
})
