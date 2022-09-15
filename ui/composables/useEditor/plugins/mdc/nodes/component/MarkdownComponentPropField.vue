<script setup lang="ts">
import { pascalCase } from 'scule'
import type { ComponentPropSchema } from '../../../../types'

const props = defineProps({
  schema: {
    type: Object as () => ComponentPropSchema,
    required: true
  },
  value: {
    type: [String, Boolean, Number],
    default: (props: { schema: ComponentPropSchema }) => {
      return typeof props.schema.default !== 'undefined' && props.schema.default !== null
        ? props.schema.default
        : undefined
    }
  }
})

const emit = defineEmits<{
  (event: 'change', ...args: any[]): void
}>()

const name = computed(() => props.schema.name)
const type = computed(() => props.schema.type)
const label = computed(() => pascalCase(name.value))

const emitChange = (value) => {
  emit('change', value)
}
</script>

<template>
  <UFormGroup :name="name" :label="label" label-class="text-xs font-medium u-text-gray-900">
    <UCheckbox
      v-if="type === 'boolean'"
      :name="name"
      :model-value="value"
      size="xs"
      @update:model-value="emitChange"
    />
    <USelect
      v-else-if="schema.values && Array.isArray(schema.values) && schema.values.length"
      :name="name"
      :model-value="value"
      :options="schema.values"
      size="xs"
      @update:model-value="emitChange"
    />
    <UInput
      v-else
      :name="name"
      :type="type === 'number' ? 'number' : 'text'"
      :model-value="value"
      size="xs"
      @update:model-value="emitChange"
      @keydown.stop
      @paste.stop
    />
  </UFormGroup>
</template>
