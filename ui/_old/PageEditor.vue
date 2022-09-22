<template>
  <Splitpanes class="default-theme h-full overflow-hidden">
    <!-- <pane class="p-4" min-size="8" size="10">
      <ContentTree v-if="tree" :tree="tree" :current="file.id" @select="selectFile" />
    </pane> -->
    <Pane size="15">
      <div>
        <FileTree
          :tree="tree"
          :expanded-dirs="{ content: true }"
          @select="selectFile"
          @delete="deleteFile"
          @create="createFile"
        />
      </div>
    </Pane>
    <Pane size="35">
      <template v-if="editor === 'raw'">
        <LazyMarkdownEditor
          :model-value="content.source"
          class="h-full"
          @update:model-value="onMarkdownUpdate"
        >
          <template #fallback>
            <div h-full>
              Loading...
            </div>
          </template>
        </LazyMarkdownEditor>
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
          <LazyContentEditor
            :components="components"
            :content="content"
            class="px-4 py-6 min-h-full"
            @update="onMarkdownUpdate"
          >
            <template #fallback>
              <div h-full>
                Loading...
              </div>
            </template>
          </LazyContentEditor>
        </div>
      </template>
    </Pane>
    <Pane size="50" class="h-full">
      <PreviewViewer
        v-model:path="previewPath"
        :base="previewBase"
      />
    </Pane>
  </Splitpanes>
</template>

<!-- Content Editor -->
<script setup lang="ts">
import { Splitpanes, Pane } from 'splitpanes'

const { query } = useRoute()

// TODO: remove localhost when not in dev
const previewBase = ref('http://localhost:3000')
const previewPath = ref(query.path as string || '/')

const editor = ref('raw') // raw | component
const file = ref({
  id: '',
  data: {},
  content: '',
  source: '',
  _path: '/',
  _file: '',
  image: '',
  title: '',
  description: ''
})

const content = computed(() => ({
  key: file.value.id,
  markdown: file.value.content,
  source: file.value.source,
  matter: {}
}))

const { apiURL } = useRuntimeConfig().public.studio
const { data: tree, refresh: refreshTree } = await useFetch<any[]>('/files', { baseURL: apiURL })
const { data: components } = await useFetch<any[]>('/components', { baseURL: apiURL })

async function selectFile (id: string) {
  if (file.value.id === id) {
    return
  }

  file.value = await $fetch<any>(`/files/${id}`, { baseURL: apiURL })
}

async function deleteFile (id) {
  await $fetch<any>(`/files/${id}`, {
    baseURL: apiURL,
    method: 'DELETE'
  })
  // TODO: update the tree
  await refreshTree()
}

async function createFile (id) {
  await $fetch<any>(`/files/${id}`, {
    baseURL: apiURL,
    method: 'PUT'
  })
  // TODO: update the tree
  await refreshTree()
}

const onMarkdownUpdate = async (md) => {
  if (!file.value.id) { return }
  if (editor.value === 'component') {
    const parts = file.value.source.split(/---\n/)
    const matter = parts.length >= 2 ? `---\n${parts[1]}---\n\n` : ''
    md = matter + md
  }
  await $fetch<any>(`files/${file.value.id}`, {
    baseURL: apiURL,
    method: 'POST',
    body: {
      source: md
    }
  })
}

if (tree.value) {
  const contentDirectory = tree.value.find(item => item.path === 'content')
  if (contentDirectory) {
    const file = contentDirectory.children[0]

    if (file) {
      selectFile(file.id)
    }
  }
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
