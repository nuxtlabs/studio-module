<template>
  <Splitpanes class="default-theme h-full overflow-hidden">
    <!-- <pane class="p-4" min-size="8" size="10">
      <ContentTree v-if="tree" :tree="tree" :current="file.id" @select="selectFile" />
    </pane> -->
    <Pane size="30">
      <!-- <div class="flex justify-between items-center p-4">
        <USelect
          v-model="selectedFileId"
          name="file"
          :options="files"
          placeholder="Select a page"
          text-attribute="_path"
          value-attribute="_file"
          size="sm"
          class="w-full"
        />
        <UButton square size="sm" icon="octicon:plus-24" class="ml-4" />
      </div> -->
      <div class="h-full overflow-y-auto">
        <div class="border-b u-border-gray-100 p-4 text-sm overflow-hidden">
          <!-- TODO: get the meta image from app config as well (fallback state) -->
          <img v-if="file.image" :src="file.image" class="aspect-video float-right">
          <EmptyImage v-else class="w-40 aspect-video float-right rounded" />
          <p><span class="font-bold u-text-gray-400 text-xs">title</span> {{ file.title }}</p>
          <p><span class="font-bold u-text-gray-400 text-xs">description</span> {{ file.description }}</p>
        </div>
        <ClientOnly>
          <ContentEditor
            :components="components"
            :content="content"
            class="px-4 py-6 min-h-full"
            @update="onMarkdownUpdate"
          />
          <template #fallback>
            <div class="min-h-full">Loading...</div>
          </template>
        </ClientOnly>
      </div>
    </Pane>
    <Pane size="70" class="h-full">
      <PreviewViewer v-model:url="previewUrl"/>
    </Pane>
  </Splitpanes>
</template>

<!-- Content Editor -->
<script setup lang="ts">
import { Splitpanes, Pane } from 'splitpanes'

const ContentEditor = defineAsyncComponent(async () =>
  process.server
    ? { render: () => null }
    : await import('./ContentEditor.vue').then(r => r.default)
)

const previewUrl = ref('http://localhost:3000')

const file = ref({
  id: '',
  data: {},
  content: '',
  source: ''
})

const content = computed(() => ({
  key: file.value.id,
  markdown: file.value.content,
  matter: {}
}))

const { apiURL } = useRuntimeConfig().public.studio
const { data: files } = await useFetch<any[]>('/content/files', { baseURL: apiURL })
const { data: components } = await useFetch<any[]>('/components', { baseURL: apiURL })

async function selectFile (id: string) {
  file.value = await $fetch<any>(`/content/${id}`, { baseURL: apiURL })
}
const selectedFileId = ref(null)
if (files.value?.length) {
  selectedFileId.value = files.value[0]._file
  await selectFile(files.value[0]._file)
}
const onMarkdownUpdate = async (md) => {
  if (!file.value.id) { return }
  const parts = file.value.source.split(/---\n/)
  const matter = parts.length >= 2 ? `---\n${parts[1]}---\n\n` : ''
  await $fetch<any>(`content/${file.value.id}`, {
    baseURL: apiURL,
    method: 'POST',
    body: {
      content: matter + md
    }
  })
}
watch(selectedFileId, (id: string) => {
  selectFile(id)
})
</script>

<style lang="postcss">
@import 'https://fonts.googleapis.com/icon?family=Material+Icons+Outlined';
@import 'https://unpkg.com/prism-themes@1.9.0/themes/prism-one-dark.css';
@import 'https://unpkg.com/splitpanes/dist/splitpanes.css';

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
