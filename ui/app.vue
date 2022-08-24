<template>
  <div>
    <header class="fixed h-10 left-0 right-0 z-20">
      <div class="flex items-center gap-2 p-2">
        <UButton square icon="heroicons-outline:menu-alt-2" size="xxs" variant="gray" />
        <UButton class="flex items-center gap-1 text-xs fond-bold" size="xxs" variant="gray">
          <span class="font-bold u-text-gray-400">page</span> /
        </UButton>
        <UButton class="flex items-center gap-1 text-xs fond-bold" size="xxs" variant="gray">
          <span class="font-bold u-text-gray-400">layout</span> blog
        </UButton>
        <UButton icon="heroicons-solid:plus" size="xxs" variant="gray">
          new
        </UButton>
      </div>
    </header>
    <main class="pt-10">
      <PageEditor />
    </main>
  </div>
</template>

<style scoped>
.dark header {
  background: rgb(0,0,0,0.8);
}
header {
  backdrop-filter: saturate(180%) blur(20px);
  background: rgb(255,255,255,0.8);
  border-bottom: 1px #eee solid;
}
</style>
