<script setup lang="ts">
import { paths, PathKey } from './icons'

const props = defineProps({
  name: {
    type: String as () => PathKey,
    required: true,
    validator: (name: string) => Boolean(paths[name as PathKey])
  }
})

const path = computed(() => paths[props.name])
</script>

<template>
  <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="path" />
  </svg>
</template>
