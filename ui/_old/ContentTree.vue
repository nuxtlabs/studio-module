<script setup lang="ts">
import type { Tree } from '../../src/runtime/server/api/content/tree.get'

defineProps({
  current: {
    type: String,
    default: ''
  },
  level: {
    type: Number,
    default: 0
  },
  tree: {
    type: Array as () => Tree,
    default: () => []
  }
})

defineEmits(['select'])
</script>

<template>
  <div :class="{ 'ml-2': level > 0 }">
    <div v-for="item in tree" :key="`${level}-${item.type}-${item.name}`">
      <div v-if="item.type === 'folder'">
        <div class="flex items-center gap-1">
          <UIcon name="uil:folder" /> {{ item.name }}
        </div>
        <ContentTree :level="level + 1" :tree="item.items" :current="current" @select="id => $emit('select', id)" />
      </div>
      <div v-else class="hover:cursor-pointer hover:underline" :class="{ 'font-bold': item.id === current }" @click="$emit('select', item.id)">
        <div class="flex items-center gap-1">
          <UIcon name="uil:file" /> {{ item.name }}
        </div>
      </div>
    </div>
  </div>
</template>
