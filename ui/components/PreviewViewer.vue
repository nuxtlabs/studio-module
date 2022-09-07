<script setup lang="ts">
import { IframePayload } from '~/../types'

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

useEventListener('message', (event) => {
  if (!event?.data?.nuxtStudio) {
    return
  }

  const data = event.data as IframePayload
  if (data.type === 'router') {
    emit('update:path', event.data.path)
    router.replace({ query: { path: data.path } })
  }
})

watch(() => props.path, () => {
  iframe.value.contentWindow.postMessage({ nuxtStudio: true, type: 'router', path: props.path }, '*')
})
</script>

<template>
  <div class="w-full h-full overflow-auto">
    <iframe ref="iframe" class="w-full min-h-full" :src="initialUrl" />
  </div>
</template>
