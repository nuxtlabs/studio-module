<script lang="ts">
import { defineComponent, defineAsyncComponent, computed } from 'vue'
import type { UnwrapOptions } from '../composables/useEditor/types'

export default defineComponent({
  components: {
    VueEditor: defineAsyncComponent(async () => {
      const { VueEditor } = await import('@milkdown/vue')
      return VueEditor
    })
  },
  inheritAttrs: false,
  props: {
    content: {
      type: Object as () => UnwrapOptions['content'],
      required: true
    },
    components: {
      type: Array as () => UnwrapOptions['components'],
      default: () => []
    }
  },
  emits: ['update'],
  async setup (props, { emit }) {
    if (process.server) {
      return { editor: null }
    }

    const { useEditor } = await import('../composables/useEditor')

    const editor = useEditor({
      components: computed(() => [...props.components]),
      content: computed(() => props.content),
      onChanged: (markdown: string) => emit('update', markdown)
    })

    return {
      editor
    }
  }
})
</script>

<script lang="ts">

</script>

<template>
  <ClientOnly>
    <VueEditor v-if="editor" v-bind="{ ...$attrs, editor }" />
    <template #fallback>
      <slot name="loading" />
    </template>
  </ClientOnly>
</template>

<style>
@import 'https://fonts.googleapis.com/icon?family=Material+Icons+Outlined';
@import 'https://unpkg.com/prism-themes@1.9.0/themes/prism-one-dark.css';

.milkdown {
  padding: 0;
  width: 100%;
  height: 100;
  position: relative;
  background: transparent !important;
  box-shadow: none !important;
}
.milkdown > .editor {
  width: 100%;
  height: 100%;
  position: relative;
  overflow-y: auto;
}

.milkdown > .editor > :first-child, .milkdown >.editor > :first-child > div {
  margin: 0 !important;
}

.milkdown span[data-type="emoji"] > img {
  display: inline;
}

.ProseMirror .task-list-item p:first-child {
  margin: 0.5em 0;
}

.ProseMirror ul {
  list-style: disc;
  padding-inline-start: 2rem;
}

.ProseMirror ol {
  list-style: decimal;
  padding-inline-start: 2rem;
}

.ProseMirror-separator {
  display: inline;
}
</style>
