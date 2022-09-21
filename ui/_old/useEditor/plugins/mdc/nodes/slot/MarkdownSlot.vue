<template>
  <div
    class="px-4 py-2 my-2 border rounded-md u-bg-white"
    :class="isFocused ? 'border-primary-500' : 'u-border-gray-200'"
    data-test="markdown-slot"
    @mouseenter="showActions = true"
    @mouseleave="showActions = false"
  >
    <div class="flex items-center justify-between h-6">
      <span class="text-xs font-semibold u-text-gray-900">
        {{ name }}
      </span>
      <div class="flex flex-row items-center justify-center transition-opacity duration-200" :class="{ 'opacity-0': !showActions }" data-test="actions">
        <button
          v-for="{ icon, onClick } in actions"
          :key="icon"
          class="p-1 -mr-2 u-text-gray-500 hover:u-text-gray-700 focus:u-text-gray-700"
          :data-test="icon"
          @click="onClick"
        >
          <Icon :name="icon" />
        </button>
      </div>
    </div>
    <slot />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { pascalCase } from 'scule'
import Icon from '../utils/Icon.vue'
import type { IconAction } from '../utils/icons'
import useNode from '../utils/useNode'

const { node, isFocused, remove } = useNode()

const name = pascalCase(node.attrs.name)
const showActions = ref(false)

const actions: IconAction[] = [
  { icon: 'trash', onClick: remove }
]
</script>
