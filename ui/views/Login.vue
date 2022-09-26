<script setup lang="ts">
const studio = useStudio()
</script>

<template>
  <div class="flex-col overflow-auto">
    <div class="flex justify-between items-center p-4 mb-2">
      <Logo class="h-5" alt="Nuxt Studio" />
      <ColorModeToggle class="h-4" />
    </div>
    <div class="p-4">
      <UButton variant="gray" to="https://dev-station.nuxt.com" @click="studio.quit()">
        Login with Nuxt Station
      </UButton>
    </div>
  </div>
</template>
