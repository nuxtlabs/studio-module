export default defineEventHandler((_) => {
  return $fetch('/api/_content/navigation')
})
