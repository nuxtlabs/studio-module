<script setup>
const config = useRuntimeConfig().public.studio
const { data: components } = await useFetch('/api/_studio/components')
const appConfig = useAppConfig()
</script>

<template>
  <NuxtLayout>
    <h1>useRuntimeConfig().public.studio</h1>
    <pre>{{ config }}</pre>
    <h1>useAppConfig()</h1>
    <pre>{{ appConfig }}</pre>
    <h1>/api/_studio/components</h1>
    <pre>{{ components }}</pre>
  </NuxtLayout>
</template>
