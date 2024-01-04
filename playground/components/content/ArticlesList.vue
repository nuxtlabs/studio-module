<script setup>
const { data: articles } = useAsyncData('articles', () => queryContent('/articles/').find())
</script>

<template>
  <UPageGrid>
    <UPageCard
      v-for="article in articles"
      :key="article._slug"
      :title="article.title"
      :description="article.description"
      :to="article._path"
    />
  </UPageGrid>
</template>
