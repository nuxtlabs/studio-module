<script setup lang="ts">
import { createBirpc } from 'birpc'
import { IframeClientFunctions, StudioFunctions } from '~/../types'

const props = defineProps<{
  base: string,
  path: string,
}>()

const initialUrl = props.base + props.path
const emit = defineEmits<{
  (event: 'update:path', v: string): void
}>()
const iframe = ref(null)
const router = useRouter()

const rpc = createBirpc<IframeClientFunctions, StudioFunctions>(
  // rpc functions to be called by the iframe
  {
    onRouteChanged (route) {
      emit('update:path', route)
      router.replace({ query: { path: route } })
    }
  },
  // messaging options
  {
    on (fn) {
      useEventListener('message', (event) => {
        if (event?.data?.__nuxtStudio) {
          fn(event.data.data)
        }
      })
    },
    post (data) {
      iframe.value.contentWindow.postMessage({ __nuxtStudio: true, data }, '*')
    }
  }
)

watch(() => props.path, (route) => {
  rpc.onRouteChanged(route)
})
</script>

<template>
  <div class="w-full h-full overflow-auto">
    <iframe ref="iframe" class="w-full min-h-full" :src="initialUrl" />
  </div>
</template>
