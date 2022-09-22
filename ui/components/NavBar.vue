<script setup lang="ts">
</script>

<template>
  <div class="flex justify-between items-center p-4 mb-2">
    <a @click="setStudioView('Home')">
      <Logo class="h-5" alt="Nuxt Studio" />
    </a>
    <ColorModeToggle class="h-4" />
  </div>
</template>
