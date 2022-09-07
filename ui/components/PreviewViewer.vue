<script setup lang="ts">
import type { IframePayload } from '~/../types'

const props = defineProps<{
  url: string,
}>()

const emit = defineEmits<{
  (event: 'update:url', v: string): void
}>()

const iframe = ref<HTMLIFrameElement>()
const iframeUrl = ref(props.url)
const urlInput = ref(props.url)
let skipNext = false

watch(
  () => props.url,
  (v) => {
    urlInput.value = v
    if (!skipNext) {
      iframeUrl.value = v
    }
    skipNext = false
  }
)

const { canRedo, canUndo, redo, undo } = useRefHistory(computed({
  get () {
    return props.url
  },
  set (v) {
    go(v)
  }
}))

function go (url: string) {
  emit('update:url', url)
}

useEventListener('message', (e) => {
  if (!iframe.value) {
    return
  }
  if (e.source !== iframe.value.contentWindow) {
    return
  }

  const data = JSON.parse(e.data) as IframePayload
  if (data.type === 'push') {
    nextTick(() => {
      if (data.url !== props.url) {
        skipNext = true
        go(data.url)
      }
    })
  }

  console.log('message from iframe', data)
})
</script>

<template>
  <div class="grid grid-rows-[max-content_1fr] h-full overflow-hidden">
    <div class="flex p-2 gap-2 border-b border-gray-400">
      <UButton
        :disabled="!canUndo"
        square
        icon="heroicons-outline:arrow-left"
        size="xs"
        variant="gray"
        @click="undo()"
      />
      <UButton
        :disabled="!canRedo"
        square
        icon="heroicons-outline:arrow-right"
        size="xs"
        variant="gray"
        @click="redo()"
      />
      <UInput
        v-model="urlInput"
        name="url"
        size="xs"
        placeholder="Enter text"
        class="w-full"
        @keypress.enter="go(urlInput)"
      />
    </div>
    <div class="w-full h-full overflow-auto">
      <iframe ref="iframe" class="w-full min-h-full" :src="iframeUrl" />
    </div>
  </div>
</template>
