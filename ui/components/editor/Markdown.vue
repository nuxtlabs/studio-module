<template>
  <div class="relative h-full w-full">
    <div ref="target" class="h-full w-full" />
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  filename: {
    type: String,
    default: ''
  },
  modelValue: {
    type: String,
    required: true
  },
  language: {
    type: String,
    default: ''
  }
})

const target = ref()

const language = computed(() => {
  if (props.language) {
    return props.language
  }
  const ext = props.filename.split('.').pop()
  switch (ext) {
    case 'vue':
      return 'html'
    case 'js':
      return 'javascript'
    case 'ts':
      return 'typescript'
    case 'json':
      return 'json'
    default:
      return 'mdc'
  }
})

const { setContent, setLanguage } = useMonaco(target, {
  language: language.value,
  code: props.modelValue,
  readOnly: false,
  onChanged (content: string) {
    if (props.modelValue !== content) {
      emit('update:modelValue', content)
    }
  },
  onDidCreateEditor () {
  }
})

watch(() => language.value, (lang) => {
  setLanguage(lang)
})

watch(
  () => props.modelValue,
  () => setContent(props.modelValue)
)

const emit = defineEmits(['update:modelValue'])
</script>
