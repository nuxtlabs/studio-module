<script setup>
const appConfig = useAppConfig()
const { data: navigation } = useAsyncData('navigation', () => fetchContentNavigation())
</script>

<template>
  <div>
    <UHeader
      :title="appConfig.title"
      :links="mapContentNavigation(navigation)"
    />
    <UMain>
      <UContainer>
        <NuxtPage />
      </UContainer>
    </UMain>
  </div>
</template>
