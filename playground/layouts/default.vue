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
      <li>
        <NuxtLink to="/debug">
          Debug
        </NuxtLink>
      </li>
    </ul>
    <select v-model="$colorMode.preference">
      <option value="system">
        System
      </option>
      <option value="light">
        Light
      </option>
      <option value="dark">
        Dark
      </option>
    </select>
    <slot />
  </div>
</template>

<style>
body {
  background: white;
  color: black;
}
.dark-mode body {
  background: black;
  color: white;
}
a {
  color: blue;
}
.dark-mode a {
  color: lightblue;
}
.container {
  padding: 0 20px;
}
</style>
