<template>
  <div class="h-screen w-screen grid grid-rows-[max-content_1fr] overflow-hidden">
    <main class="h-screen overflow-hidden">
      <PageEditor />
    </main>
  </div>
</template>

<style scoped>
html, body {
  height: 100%;
  overflow: hidden;
  overscroll-behavior-y: none;
}
.dark header {
  background: rgb(0,0,0,0.8);
}
header {
  backdrop-filter: saturate(180%) blur(20px);
  background: rgb(255,255,255,0.8);
  border-bottom: 1px rgb(125,125,125,0.5) solid;
}
</style>
