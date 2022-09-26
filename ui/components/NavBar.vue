<script setup lang="ts">
</script>

<template>
  <div class="flex justify-between items-center p-2 max-h-[3rem] min-h-[3rem]">
    <slot>
      <div class="px-2">
        <a @click="setStudioView('Home')">
          <Logo class="h-5" alt="Nuxt Studio" />
        </a>
      </div>
    </slot>
    <div class="flex gap-2 items-center h-full px-2">
      <ColorModeToggle />
    </div>
  </div>
</template>
