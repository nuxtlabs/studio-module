<script setup lang="ts">
import { NuxtStudioClient, NuxtStudioEditor } from '~/../types'

const studio = useStudio()
const initialUrl = studio.value.previewPath
const iframe = ref<HTMLIFrameElement>()
const router = useRouter()

let client: NuxtStudioClient | undefined
const editor: NuxtStudioEditor = {
  nuxt: useNuxtApp(),
  onRouteChanged (route) {
    studio.value.previewPath = route
    router.replace({ query: { path: route } })
  }
}

function updateClient () {
  client = studio.value.previewClient = iframe.value?.contentWindow.__NUXT_STUDIO__
  if (!client) {
    setTimeout(updateClient, 100)
  } else {
    client.updateEditor(editor)
  }
}

onMounted(updateClient)

watch(() => studio.value.previewPath, (route) => {
  client?.onRouteChanged(route)
})
</script>

<template>
  <div class="w-full h-full overflow-auto">
    <iframe ref="iframe" class="w-full min-h-full" :src="initialUrl" @load="updateClient" />
  </div>
</template>
