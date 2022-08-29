import { defineEventHandler } from 'h3'

export default defineEventHandler((_) => {
  return $fetch('/api/_content/query?without=body,excerpt')
})
