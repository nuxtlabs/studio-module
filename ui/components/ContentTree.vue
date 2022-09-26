<script setup lang="ts">
const studio = $(useStudio())

async function deleteFile (id) {
  await $fetch<any>(`/files/${id}`, {
    baseURL: studio.apiURL,
    method: 'DELETE'
  })
  // TODO: update the tree
  await studio.refreshContentTree()
  if (studio.currentFile?.id === id) {
    studio.currentFile = undefined
  }
}

async function createFile (id) {
  await $fetch<any>(`/files/${id}`, {
    baseURL: studio.apiURL,
    method: 'PUT'
  })
  // TODO: update the tree
  await studio.refreshContentTree()
}
</script>

<template>
  <div>
    <FileTree
      :tree="studio.contentTree"
      :expanded-dirs="{ content: true }"
      @select="studio.selectFile"
      @delete="deleteFile"
      @create="createFile"
    />
  </div>
</template>
