<script setup lang="ts">
import { Splitpanes, Pane } from 'splitpanes'

const studio = useStudio()
</script>

<template>
  <Splitpanes class="default-theme h-full overflow-hidden">
    <Pane size="30" min-size="15">
      <component :is="studio.currentView">
        <p class="p-4 italic">
          View {{ studio.currentView }} not found.
        </p>
      </component>
    </Pane>
    <Pane size="70" class="preview">
      <Preview />
    </Pane>
  </Splitpanes>
</template>

<style lang="postcss">
@import '~/assets/css/main.css';
</style>
