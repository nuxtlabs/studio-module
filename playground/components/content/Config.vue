<script setup>
const config = useAppConfig()
</script>

<template>
  <div>
    Some config from app.config:
    <pre>
      {{ config.someConfig }}
    </pre>
  </div>
</template>
