<script setup lang="ts">
const studio = useStudio()
</script>

<template>
  <div class="flex-col overflow-auto h-full">
    <NavBar />
    <KeepAlive>
      <ContentEditor v-if="studio.currentFile" />
      <ContentTree v-else />
    </KeepAlive>
  </div>
</template>
