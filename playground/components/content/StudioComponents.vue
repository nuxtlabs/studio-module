<script setup>
const { data: studio } = await useFetch('/__studio.json')
</script>

<template>
  <pre>{{ studio.components }}</pre>
</template>
