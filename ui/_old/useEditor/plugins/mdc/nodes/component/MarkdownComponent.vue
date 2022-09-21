<template>
  <div
    class="px-4 py-3 my-4 border rounded-md u-bg-white"
    :class="isFocused ? 'border-primary-500' : 'u-border-gray-200'"
    data-test="markdown-component"
    @mouseenter="showActions = true"
    @mouseleave="showActions = false"
  >
    <div class="flex items-center justify-between h-6">
      <span class="text-xs font-semibold u-text-gray-900" contenteditable="false">
        {{ name }}
      </span>
      <div class="flex flex-row items-center justify-center transition-opacity duration-200" :class="{ 'opacity-0': !showActions }" data-test="actions">
        <button
          v-for="{ icon, onClick } in actions"
          :key="icon"
          class="p-1 u-text-gray-500 hover:u-text-gray-700 focus:u-text-gray-700"
          :data-test="icon"
          @click="onClick"
        >
          <Icon :name="icon" />
        </button>
      </div>
    </div>
    <MarkdownComponentProps v-if="hasProps" v-show="showProps" />
    <!-- TODO: Uncomment once nuxt-component-beta handles default slots -->
    <!-- <div :class="{ hidden: !hasSlots }"> -->
    <div>
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { pascalCase } from 'scule'
import type { ComponentSchema } from '../../../../types'
import Icon from '../utils/Icon.vue'
import type { IconAction } from '../utils/icons'
import useNode from '../utils/useNode'
import MarkdownComponentProps from './MarkdownComponentProps.vue'

const { node, isFocused, duplicate, remove } = useNode()

const schema = node.attrs.schema as ComponentSchema

const name = pascalCase(node.attrs.name)

const hasProps = schema && schema.props.length > 0
// const hasSlots = schema && schema.slots.length > 0

const showActions = ref(false)
const showProps = ref(true)

const actions: IconAction[] = [
  { icon: 'trash', onClick: remove },
  { icon: 'duplicate', onClick: duplicate }
]
</script>
