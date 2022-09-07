<script setup lang="ts">
import type { IframePayload } from '~/../types'

const props = defineProps<{
  path: string,
  base: string
}>()

const emit = defineEmits<{
  (event: 'update:path', v: string): void
}>()

const iframe = ref<HTMLIFrameElement>()
const iframePath = ref(props.path)
const pathInput = ref(props.path)
let skipNext = false

watch(
  () => props.path,
  (v) => {
    pathInput.value = v
    if (!skipNext) {
      iframePath.value = v
    }
    skipNext = false
  }
)

const { canRedo, canUndo, redo, undo } = useRefHistory(computed({
  get () {
    return props.path
  },
  set (v) {
    go(v)
  }
}))

function go (path: string) {
  emit('update:path', path)
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
      if (data.route.fullPath !== props.path) {
        skipNext = true
        go(data.route.fullPath)
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
        v-model="pathInput"
        name="url"
        size="xs"
        placeholder="Enter path"
        class="w-full"
        @keypress.enter="go(pathInput)"
      />
    </div>
    <div class="w-full h-full overflow-auto">
      <iframe ref="iframe" class="w-full min-h-full" :src="base + iframePath" />
    </div>
  </div>
</template>
