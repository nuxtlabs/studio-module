<template>
  <div class="relative h-full w-full">
    <div v-if="editorState === 'loading'" class="absolute left-0 top-0 h-full w-full flex justify-center items-center">
      <div type="primary">
        <span>Editor is loading...</span>
      </div>
    </div>

    <div v-else-if="editorState === 'error'" class="absolute left-0 top-0 h-full w-full flex justify-center items-center">
      <div type="warning">
        <span>Error while loading editor!</span>
      </div>
    </div>
    <div ref="target" class="h-full w-full" />
  </div>
</template>

<script setup lang="ts">
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

const editorState = ref('loading')
const target = ref()

onMounted(
  async () => {
    try {
      const { useMonaco } = await import('~/monaco-editor/useMonacoEditor')

      const { setContent } = useMonaco(target, {
        language: props.language,
        code: props.modelValue,
        readOnly: false,
        onChanged (content: string) {
          emit('update:modelValue', content)
        },
        onDidCreateEditor () {
          editorState.value = 'ready'
        }
      })

      watch(
        () => props.modelValue,
        () => setContent(props.modelValue)
      )
    } catch (_) {
      editorState.value = 'error'
    }
  }
)

const emit = defineEmits(['update:modelValue'])
</script>
