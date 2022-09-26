<!-- eslint-disable vue/no-multiple-template-root -->
<template>
  <template v-if="!file" />
  <template v-else-if="editor === 'raw'">
    <LazyEditorMarkdown
      :filename="content.key"
      :model-value="content.source"
      class="h-full"
      @update:model-value="onMarkdownUpdate"
    >
      <template #fallback>
        <div h-full>
          Loading...
        </div>
      </template>
    </LazyEditorMarkdown>
  </template>
  <template v-else>
    <div class="h-full overflow-y-auto">
      <div class="border-b u-border-gray-100 p-4 text-sm overflow-hidden">
        <!-- TODO: get the meta image from app config as well (fallback state) -->
        <img v-if="file.image" :src="file.image" class="aspect-video float-right">
        <IconEmptyImage v-else class="w-40 aspect-video float-right rounded" />
        <p><span class="font-bold u-text-gray-400 text-xs">title</span> {{ file.title }}</p>
        <p><span class="font-bold u-text-gray-400 text-xs">description</span> {{ file.description }}</p>
      </div>
      <LazyEditorContent
        :components="studio.components"
        :content="content"
        class="px-4 py-6 min-h-full"
        @update="onMarkdownUpdate"
      >
        <template #fallback>
          <div h-full>
            Loading...
          </div>
        </template>
      </LazyEditorContent>
    </div>
  </template>
</template>

<!-- Content Editor -->
<script setup lang="ts">
const studio = $(useStudio())
const editor = ref<'raw' | 'component'>('raw') // raw | component
const file = computed(() => studio.currentFile)

const content = computed(() => ({
  key: file.value.id,
  markdown: file.value.content,
  source: file.value.source,
  matter: {}
}))

const onMarkdownUpdate = async (md) => {
  if (!file.value.id) { return }
  if (editor.value === 'component') {
    const parts = file.value.source.split(/---\n/)
    const matter = parts.length >= 2 ? `---\n${parts[1]}---\n\n` : ''
    md = matter + md
  }

  await $fetch<any>(`files/${file.value.id}`, {
    baseURL: studio.apiURL,
    method: 'POST',
    body: {
      source: md
    }
  })
}
</script>

<style lang="postcss">
@import 'https://fonts.googleapis.com/icon?family=Material+Icons+Outlined';
@import 'https://unpkg.com/prism-themes@1.9.0/themes/prism-one-dark.css';

body {
  @apply antialiased font-sans text-gray-700 dark:text-gray-200;
}

.milkdown {
  flex: 1 1 0%;
}
.milkdown > .editor {
  max-width: 100% !important;
  padding: 0 !important;
  overflow-y: visible !important;
}

.milkdown > .editor > :first-child, .milkdown > .editor > :first-child > div {
  margin: 0 !important;
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
.splitpanes.default-theme .splitpanes__pane {
  @apply u-bg-white;
}
.splitpanes.default-theme .splitpanes__splitter {
  @apply u-bg-gray-100
}
.default-theme.splitpanes--vertical>.splitpanes__splitter, .default-theme .splitpanes--vertical>.splitpanes__splitter {
  @apply u-border-gray-200;
}
.splitpanes.default-theme .splitpanes__splitter:before, .splitpanes.default-theme .splitpanes__splitter:after {
  @apply u-bg-gray-300;
}
</style>
