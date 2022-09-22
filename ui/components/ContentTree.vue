<script setup lang="ts">
const studio = useStudio()

const { apiURL } = useRuntimeConfig().public.studio
const { data: tree, refresh: refreshTree } = await useFetch<any[]>('/files', { baseURL: apiURL })

async function selectFile (id: string) {
  if (studio.value.currentFile?.id === id) {
    return
  }
  studio.value.currentFile = await $fetch<any>(`/files/${id}`, { baseURL: apiURL })
}

async function deleteFile (id) {
  await $fetch<any>(`/files/${id}`, {
    baseURL: apiURL,
    method: 'DELETE'
  })
  // TODO: update the tree
  await refreshTree()
  if (studio.value.currentFile?.id === id) {
    studio.value.currentFile = undefined
  }
}

async function createFile (id) {
  await $fetch<any>(`/files/${id}`, {
    baseURL: apiURL,
    method: 'PUT'
  })
  // TODO: update the tree
  await refreshTree()
}
</script>

<template>
  <div>
    <FileTree
      :tree="tree"
      :expanded-dirs="{ content: true }"
      @select="selectFile"
      @delete="deleteFile"
      @create="createFile"
    />
  </div>
</template>
