<script setup lang="ts">
const props = defineProps<{
  url: string,
}>()

const emit = defineEmits<{
  (event: 'update:url', v: string): void
}>()

const urlInput = ref(props.url)

watch(
  () => props.url,
  (v) => {
    urlInput.value = v
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
      <iframe class="w-full min-h-full" :src="props.url" />
    </div>
  </div>
</template>
