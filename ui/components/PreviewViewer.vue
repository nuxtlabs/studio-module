<script setup lang="ts">
const props = defineProps<{
  url: string,
}>()

const emit = defineEmits<{
  (event: 'update:url', v: string): void
}>()
const iframe = ref(null)
const router = useRouter()

function ready () {
  window.addEventListener('message', (event) => {
    if (event?.data?.nuxt_studio) {
      if (event.data.type === 'router') {
        // emit('update:url', event.data.path)
        router.replace({ query: { path: event.data.path } })
      }
    }
  })
}
</script>

<template>
  <div class="w-full h-full overflow-auto">
    <iframe ref="iframe" class="w-full min-h-full" :src="props.url" @load="ready" />
  </div>
</template>
