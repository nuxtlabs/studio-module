<template>
  <ul class="relative">
    <li v-for="(file, index) of tree" :ref="el => { itemRefs[file.path] = el }" :key="index">
      <div
        class="flex items-center w-full py-2 pr-6 text-sm font-medium border-r-2 cursor-pointer group focus:u-bg-gray-50 focus:outline-none target"
        :class="{
          [`pl-[${24 + (level * 12)}px]`]: true,
          'u-bg-gray-100 u-border-gray-800 u-text-gray-900': isSelected(file),
          'border-transparent u-text-gray-500 hover:u-text-gray-900 hover:u-bg-gray-50': !isSelected(file),
          'border-transparent u-text-gray-500': isDeleted(file)
        }"
        @click="selectFile(file)"
      >
        <div class="flex items-center justify-between flex-1 w-0 gap-1 px-2">
          <div class="flex items-center min-w-0 overflow-hidden">
            <UIcon
              :name="isDir(file) ? 'heroicons-outline:folder' : 'heroicons-outline:document-text'"
              class="flex-shrink-0 w-4 h-4"
            />
            <span class="min-w-0 truncate px-2" :class="{ 'line-through opacity-50': isDeleted(file) }">
              {{ file.name }}
            </span>
          </div>
          <div class="items-center gap-1.5 -mr-1 hidden lg:group-hover:flex">
            <UButton
              v-if="isDir(file)"
              size="xxs"
              class="-my-0.5 -mr-0.5"
              variant="gray"
              icon="heroicons-outline:plus"
              @click.stop="createFile(file.path)"
            />
            <UButton
              v-if="isFile(file) && !isDeleted(file)"
              size="xxs"
              class="-my-0.5 -mr-0.5"
              variant="gray"
              icon="heroicons-outline:trash"
              @click.stop="deleteFile(file.path)"
            />
          </div>
        </div>
      </div>

      <FileTree
        v-if="isDir(file) && isDirOpen(file)"
        :level="level + 1"
        :tree="file.children"
        class="pl-2"
        @select="$emit('select', $event)"
        @create="$emit('create', $event)"
        @delete="$emit('delete', $event)"
      />
    </li>
  </ul>
</template>

<script setup lang="ts">
import { withBase } from 'ufo'
import type { PropType } from 'vue'
import type { File } from '~/../types'

const props = defineProps({
  level: {
    type: Number,
    default: 0
  },
  tree: {
    type: Array as PropType<File[]>,
    default: () => []
  },
  expandedDirs: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['select', 'delete', 'create'])
const useSelectedFile = (options) => {
  const selectedFile = ref<File | null>(null)
  const select = (file: File) => {
    selectedFile.value = file
  }

  const expandedDirs = ref(options.expandedDirs || {})
  const openDir = (path: string) => {
    expandedDirs.value[path] = !expandedDirs.value[path]
  }

  return {
    selectedFile,
    select,

    expandedDirs,
    openDir
  }
}
const { selectedFile, select, expandedDirs, openDir } = useSelectedFile({
  expandedDirs: props.expandedDirs
})

const itemRefs = ref([])
onMounted(() => {
  scrollToSelectedFile()
})
watch(() => selectedFile.value?.path, () => {
  scrollToSelectedFile()
})
// Methods
const isFile = (file: File) => file.type === 'file'
const isDir = (file: File) => file.type === 'directory'
const isDirOpen = (file: File) => !!expandedDirs.value[file.path]
const isSelected = (file: File) => selectedFile.value && file.path === selectedFile.value.path
const isDeleted = (file: File) => file.status === 'deleted'
const scrollToSelectedFile = () => {
  if (!selectedFile.value) {
    return
  }
  nextTick(() => {
    const ref = itemRefs.value[selectedFile.value.path]
    if (ref) {
      ref.scrollIntoView({ block: 'nearest' })
    }
  })
}
const selectFile = (file: File) => {
  // Prevent click when clicking on selected file
  if (selectedFile.value && selectedFile.value.path === file.path) {
    scrollToSelectedFile()
    emit('select', file.id)
    return
  }
  if (isDir(file)) {
    openDir(file.path)
    return
  }
  select(file as unknown as File)
  emit('select', file.id)
}

const createFile = (path) => {
  const name = prompt('Enter File Name')
  if (name) {
    emit('create', withBase(name, path))
  }
}
const deleteFile = (path) => {
  if (confirm('Are you sure you want to delete this file?')) {
    emit('delete', path)
  }
}
</script>
