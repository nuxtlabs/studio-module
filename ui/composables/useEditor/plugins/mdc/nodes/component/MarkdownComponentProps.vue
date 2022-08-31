<script lang="ts">
import { defineComponent } from 'vue'
import type { ComponentPropSchema } from '../../../../types'
import useNode from '../utils/useNode'
import MarkdownComponentPropField from './MarkdownComponentPropField.vue'

export default defineComponent({
  components: {
    MarkdownComponentPropField
  },
  setup () {
    const { node, updateAttributes } = useNode()

    const updateProp = ({ schema: { name, default: defaultValue, type }, value }: { schema: ComponentPropSchema, value: string | number | boolean }) => {
      updateAttributes(({ props }) => {
        const isDefault = typeof defaultValue !== 'undefined' && defaultValue === value
        if (isDefault) {
          delete props[name]
          delete props[`:${name}`]
        } else {
          props[type === 'string' ? name : `:${name}`] = value
        }
        return { props }
      })
    }

    const schemas: ComponentPropSchema[] = (node.attrs.schema?.props ?? [])
    // INFO: We do not support props of `Array`, `Object`, `Function` types for now, as we need a special UI for them
    // Supported : `String` (Input Text), `Number` (Input Number), `Boolean` (Checkbox)
    const simpleSchemas = schemas.filter(({ type }) => typeof type === 'string')

    return {
      schemas: simpleSchemas,
      props: node.attrs.props,
      updateProp
    }
  }
})
</script>

<template>
  <div class="flex flex-wrap items-center gap-2 my-2" data-test="props-panel">
    <MarkdownComponentPropField
      v-for="schema in schemas"
      :key="schema.name"
      :schema="schema"
      :value="props[schema.name] || props[`:${schema.name}`]"
      @change="value => updateProp({ schema, value })"
    />
  </div>
</template>
