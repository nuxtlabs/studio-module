<script setup lang="ts">
const props = defineProps<{
  url: string,
}>()

// TODO: remove localhost when not in dev
const initialUrl = 'http://localhost:3000' + props.url
const emit = defineEmits<{
  (event: 'update:url', v: string): void
}>()
const iframe = ref(null)
const router = useRouter()

function ready () {
  window.addEventListener('message', (event) => {
    if (event?.data?.nuxtStudio) {
      if (event.data.type === 'router') {
        // emit('update:url', event.data.path)
        router.replace({ query: { path: event.data.path } })
      }
    }
  })
}
watch(() => props.url, () => {
  iframe.value.contentWindow.postMessage({ nuxtStudio: true, type: 'router', path: props.url }, '*')
})
</script>

<template>
  <div class="w-full h-full overflow-auto">
    <iframe ref="iframe" class="w-full min-h-full" :src="initialUrl" @load="ready" />
  </div>
</template>
