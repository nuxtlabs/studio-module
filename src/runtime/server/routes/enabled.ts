import { eventHandler } from 'h3'

export default eventHandler((event) => {
  return { enabled: true }
})
