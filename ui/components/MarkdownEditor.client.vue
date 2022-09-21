<template>
  <div class="relative h-full w-full">
    <div ref="target" class="h-full w-full" />
  </div>
</template>

<script setup lang="ts">
import { useMonaco } from '~/monaco-editor/useMonacoEditor'

const props = defineProps({
  modelValue: {
    type: String,
    required: true
  },
  language: {
    type: String,
    default: 'mdc'
  }
})

const target = ref()

const { setContent } = useMonaco(target, {
  language: props.language,
  code: props.modelValue,
  readOnly: false,
  onChanged (content: string) {
    emit('update:modelValue', content)
  },
  onDidCreateEditor () {
  }
})

watch(
  () => props.modelValue,
  () => setContent(props.modelValue)
)

const emit = defineEmits(['update:modelValue'])
</script>
