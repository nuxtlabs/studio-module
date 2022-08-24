export default defineEventHandler((_) => {
  return $fetch('/api/_content/query?without=body,excerpt')
})
