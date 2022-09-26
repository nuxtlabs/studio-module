<script setup lang="ts">
const studio = $(useStudio())

function goBack () {
  if (studio.currentFile) {
    studio.currentFile = undefined
  } else {
    studio.setView('Home')
  }
}
</script>

<template>
  <div class="flex-col overflow-auto h-full">
    <NavBar>
      <div class="flex items-center">
        <div class="menu_item group" @click="goBack()">
          <UIcon name="ph:caret-left-bold" class="menu_item_caret" />
        </div>
        <IconContent class="h-6 w-6 mr-2" />
        <span class="flex-1 u-text-gray-600">Content</span>
      </div>
    </NavBar>
    <KeepAlive>
      <ContentEditor v-if="studio.currentFile" />
      <ContentTree v-else />
    </KeepAlive>
  </div>
</template>
