<script lang="ts">
import { defineComponent } from 'vue'
import { pascalCase } from 'scule'
import type { ComponentPropSchema } from '../../../../types'

export default defineComponent({
  props: {
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
  },
  emits: ['change'],
  setup (props, { emit }) {
    const { name, type } = props.schema
    const label = pascalCase(name)

    const emitChange = (value) => {
      emit('change', value)
    }

    // TODO: Find a fix for `modelValue` types in template

    return {
      name,
      label,
      type,
      emitChange
    }
  }
})
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
