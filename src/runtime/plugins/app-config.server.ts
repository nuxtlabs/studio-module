import { defineNuxtPlugin, useRequestEvent, useAppConfig } from '#imports'

// TODO: Remove workaround ASAP when Nitro supports app.config (https://github.com/unjs/nitro/issues/728)

export default defineNuxtPlugin(() => {
  const event = useRequestEvent()
  if (event.path === '/__app_config.json') {
    event.node.res.setHeader('Content-Type', 'application/json')
    event.node.res.statusCode = 200
    event.node.res.end(JSON.stringify(useAppConfig(), null, 2))
  }
})
