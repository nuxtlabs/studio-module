<script setup lang="ts">
const studio = useStudio()
</script>

<template>
  <div class="flex-col overflow-auto">
    <NavBar />
    <div class="p-2 flex-col space-y-2 flex-1">
      <div class="menu_item group" @click="studio.setView('Content')">
        <IconContent />
        <span class="menu_item_text">Content</span>
        <UIcon name="ph:caret-right-bold" class="menu_item_caret" />
      </div>
      <div class="menu_item group">
        <IconMedia />
        <span class="menu_item_text">Media</span>
        <UIcon name="ph:caret-right-bold" class="menu_item_caret" />
      </div>
      <div class="menu_item group">
        <IconComponent />
        <span class="menu_item_text">Components</span>
        <UIcon name="ph:caret-right-bold" class="menu_item_caret" />
      </div>
      <div class="menu_item group">
        <IconDesign />
        <span class="menu_item_text">Design</span>
        <UIcon name="ph:caret-right-bold" class="menu_item_caret" />
      </div>
      <div class="menu_item group">
        <IconConfig />
        <span class="menu_item_text">App Config</span>
        <UIcon name="ph:caret-right-bold" class="menu_item_caret" />
      </div>
      <div class="menu_item group">
        <IconDevtools />
        <span class="menu_item_text">Devtools</span>
        <UIcon name="ph:caret-right-bold" class="menu_item_caret" />
      </div>
    </div>
    <div class="flex items-center p-4">
      <UButton variant="gray" icon="ph:x-duotone" size="xxs" @click="studio.quit()">
        Close Studio
      </UButton>
      <UTooltip :text="studio.previewClient ? 'Connected to preview' : 'Connecting...'">
        <UButton :loading="!studio.previewClient" variant="transparent" icon="ph:check-circle-duotone" />
      </UTooltip>
    </div>
  </div>
</template>

<style lang="postcss">
.menu_item {
  @apply flex font-medium items-center gap-3 hover:u-bg-gray-100 cursor-pointer rounded p-2;
  & .menu_item_text {
    @apply flex-1 u-text-gray-600 group-hover:u-text-gray-900;
  }
  & .menu_item_caret {
    @apply opacity-50 group-hover:opacity-100;
  }
}
</style>
