<script setup>
const colorMode = useColorMode()
const onClick = () => (colorMode.value === 'light' ? (colorMode.preference = 'dark') : (colorMode.preference = 'light'))
</script>

<template>
  <button aria-label="Color Mode" class="inline-block w-5" @click="onClick">
    <ColorScheme placeholder="...">
      <UIcon v-if="colorMode.value === 'dark'" name="ph:moon" class="w-5 h-5" />
      <UIcon v-else name="ph:sun" class="w-5 h-5" />
    </ColorScheme>
  </button>
</template>
