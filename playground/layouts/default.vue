<script setup>
const { navigation } = useContent()
</script>

<template>
  <div class="container">
    <ul>
      <li v-for="link of navigation" :key="link._path">
        <NuxtLink :to="link._path">
          {{ link.title }}
        </NuxtLink>
      </li>
    </ul>
    <slot />
  </div>
</template>

<style scoped>
.container {
  padding: 0 20px;
}
</style>
