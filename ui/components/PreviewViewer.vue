<script setup lang="ts">
import { NuxtStudioClient, NuxtStudioEditor } from '~/../types'

const props = defineProps<{
  base: string,
  path: string,
}>()

const initialUrl = props.base + props.path
const emit = defineEmits<{
  (event: 'update:path', v: string): void
}>()
const iframe = ref<HTMLIFrameElement>()
const router = useRouter()
let client: NuxtStudioClient | undefined
const editor: NuxtStudioEditor = {
  nuxt: useNuxtApp(),
  onRouteChanged (route) {
    emit('update:path', route)
    router.replace({ query: { path: route } })
  }
}

function updateClient () {
  client = iframe.value?.contentWindow.__NUXT_STUDIO__
  if (!client) {
    setTimeout(updateClient, 1000)
  } else {
    client.updateEditor(editor)
  }
}

onMounted(updateClient)

watch(() => props.path, (route) => {
  client?.onRouteChanged(route)
})
</script>

<template>
  <div class="w-full h-full overflow-auto">
    <iframe ref="iframe" class="w-full min-h-full" :src="initialUrl" @load="updateClient" />
  </div>
</template>
