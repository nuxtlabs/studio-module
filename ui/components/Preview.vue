<script setup lang="ts">
import { NuxtStudioClient, NuxtStudioEditor } from '~/../types'

const studio = $(useStudio())
const initialUrl = studio.previewPath
const iframe = ref<HTMLIFrameElement>()
const router = useRouter()

let client: NuxtStudioClient | undefined
const editor: NuxtStudioEditor = {
  nuxt: useNuxtApp(),
  onRouteChanged (route) {
    studio.previewPath = route
    router.replace({ query: { path: route } })
  }
}

function updateClient () {
  client = studio.previewClient = iframe.value?.contentWindow.__NUXT_STUDIO__
  if (!client) {
    setTimeout(updateClient, 100)
  } else {
    client.updateEditor(editor)
  }
}

onMounted(updateClient)

watch(() => studio.previewPath, (route) => {
  client?.onRouteChanged(route)
})
</script>

<template>
  <div class="w-full h-full overflow-auto">
    <iframe ref="iframe" class="w-full min-h-full" :src="initialUrl" @load="updateClient" />
    <div class="fixed bottom-4 ml-4">
      <!-- TODO: Display the button if document driven mode + leverage useContent().page._file -->
      <UButton variant="gray" size="sm">
        Edit this page
      </UButton>
    </div>
  </div>
</template>
